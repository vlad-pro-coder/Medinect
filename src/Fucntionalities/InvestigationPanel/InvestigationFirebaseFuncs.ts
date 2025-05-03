import { get, getDatabase, push, ref, set } from 'firebase/database'
import { getDownloadURL, getStorage, uploadBytes, ref as refstg, listAll, deleteObject } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'
import { app } from '../../App';
import StorageUniversalDeletion from '../MedicalDocuments/StorageUniversalDeletion';

interface InvestigationNode {
    NodeCreationDate:string;
    RevelantFilesPath: string;//also the nodes ID as i remember the node relevant info through its ID
    EveryOneWhoEdited: string[];
    ChildrenNodes: { [key: string]: InvestigationNode };
}

interface InvestigationNodeWithDepth extends Omit<InvestigationNode, 'ChildrenNodes'> {
    vertical: number;
    horizontal: number;
    ChildrenNodesIds: string[]
    DataBaseFullPath:string;
}

export const NewInvestigationGenerator = async (PacientUID: string, DoctorWhoCreatedUID: string, Title: string) => {

    const NewID = uuidv4()
    const db = getDatabase(app)

    await push(ref(db, `users/${DoctorWhoCreatedUID}/ParticipatingInvestigations`),NewID)
    await push(ref(db, `users/${PacientUID}/ParticipatingInvestigations`),NewID)

    await set(ref(db, `Investigations/${NewID}`), {
        InvestigationName: Title,
        DoctorParticipants: [DoctorWhoCreatedUID],
        Pacient: PacientUID,
        InvestigationID: NewID,
        DateOfCreation: (new Date()).toISOString(),
    })

    await set(ref(db, `InvestigationTrees/${NewID}`), {
        NodeCreationDate: (new Date()).toISOString(),
        RevelantFilesPath: NewID,
        EveryOneWhoEdited: [DoctorWhoCreatedUID],
        ChildrenNodes: {},
    })

}

export const AddFilesToNode = async (FilesToAdd: File[], WhoAdded: string, NodeID: string, MasterID: string, NodeFullPath: string) => {

    const db = getDatabase(app)
    const storage = getStorage(app)

    await set(ref(db, `InvestigationNodesFilesStatus/${MasterID}/${NodeID}`), "uploading")

    const uploadPromises = FilesToAdd.map((file) => {
        const fileRef = refstg(storage, `InvestigationsStorage/${MasterID}/${NodeID}/${uuidv4()}`);

        // Upload the file and return the promise
        return uploadBytes(fileRef, file)
            .then((snapshot) => {
                return getDownloadURL(snapshot.ref).then((url) => ({
                    fileName: file.name,
                    url,
                }));
            })
            .catch((error) => {
                console.error(`Error uploading ${file.name}:`, error);
                return { fileName: file.name, error: error.message }; // Return error info for failed uploads
            });

    });

    const ListOfWhoEdited: string[] = (await get(ref(db, `InvestigationTrees/${NodeFullPath}`))).val().EveryOneWhoEdited
    if (!ListOfWhoEdited.includes(WhoAdded)) {
        ListOfWhoEdited.push(WhoAdded)
        await set(ref(db, `InvestigationTrees/${NodeFullPath}/EveryOneWhoEdited`), ListOfWhoEdited)
    }

    const result = await Promise.allSettled(uploadPromises)

    const successful = result
        .filter((result) => result.status === "fulfilled")
        .map((result) => (result as PromiseFulfilledResult<any>).value);

    const failedUploads = result
        .filter((result) => result.status === "rejected")
        .map((result) => (result as PromiseRejectedResult).reason);

    await set(ref(db, `InvestigationNodesFilesStatus/${MasterID}/${NodeID}`), "uploaded")

    return { successful: successful, failed: failedUploads }

}

export const CreateNewTreeNode = async (ParentNodeDatabasePath:string,WhoAddedTheNode:string) => {

    const newNodeID = uuidv4()

    const db = getDatabase(app)

    await set(ref(db,`InvestigationTrees/${ParentNodeDatabasePath}/ChildrenNodes/${newNodeID}`),{
        NodeCreationDate: (new Date()).toISOString(),
        RevelantFilesPath: newNodeID,
        EveryOneWhoEdited: [WhoAddedTheNode],
        ChildrenNodes: {},
    })
}

export const DeleteNodeAndItsChildren = async (NodeDatabaseFullPath:string,MasterID:string,NodeID:string,FlattenedTree:{[key: string]: InvestigationNodeWithDepth;}) =>{

    const db = getDatabase(app)
    const storage = getStorage(app)

    const everyNodeToDelete:string[] = []
    const recoursivFindEveryChildNode = (NodeID:string) => {
        everyNodeToDelete.push(NodeID)
        FlattenedTree[NodeID].ChildrenNodesIds.forEach((childID:string)=>{
            recoursivFindEveryChildNode(childID)
        })
    }

    recoursivFindEveryChildNode(NodeID)

    try{
        await set(ref(db,`InvestigationTrees/${NodeDatabaseFullPath}`),{});
        console.log("deleted in db")
    }catch(err){
        console.error(err,"removing leafes")
    }
    

    for (const NodeToDeleteID of everyNodeToDelete) {
        try {
            const directoryRef = refstg(storage, `InvestigationsStorage/${MasterID}/${NodeToDeleteID}`);
    
            // List all files in the directory
            const { items } = await listAll(directoryRef);
    
            // Delete each file
            const deletePromises = items.map((item) => deleteObject(item));
            await Promise.all(deletePromises);
    
            console.log(`Successfully deleted files in ${NodeToDeleteID}`);
        } catch (error) {
            console.error(`Error deleting files in ${NodeToDeleteID}:`, error);
        }
    }
}

export const DeleteInvestigation = async (InvestigationID:string) =>{

    const db = getDatabase(app)
    const uid = (await get(ref(db,`Investigations/${InvestigationID}/Pacient`))).val()

    await set(ref(db,`Investigations/${InvestigationID}`),null)
    await set(ref(db,`InvestigationTrees/${InvestigationID}`),null)
    await set(ref(db,`InvestigationNodesFilesStatus/${InvestigationID}`),null)

    await StorageUniversalDeletion(`InvestigationsStorage/${InvestigationID}`)

    const doctorInvestigations = (await get(ref(db,`users/${uid}/ParticipatingInvestigations`))).val()
    let toDetelekey = ""
    Object.keys(doctorInvestigations).forEach((key:string)=>{
        if(doctorInvestigations[key] === InvestigationID)
            toDetelekey = key
    })

    await set(ref(db,`users/${uid}/ParticipatingInvestigations/${toDetelekey}`),null)
}

export const LeaveInvestigation = async (InvestigationID:string,WhoLeaves:string) =>{

    const db = getDatabase(app)
    try{
        const doctors = (await get(ref(db,`Investigations/${InvestigationID}/DoctorParticipants`))).val()
        await set(ref(db,`Investigations/${InvestigationID}/DoctorParticipants`),doctors.filter((doctor:string)=>doctor!==WhoLeaves))
    }catch(err){
        console.error(err)
    }


    const doctorInvestigations = (await get(ref(db,`users/${WhoLeaves}/ParticipatingInvestigations`))).val()
    let toDetelekey = ""
    Object.keys(doctorInvestigations).forEach((key:string)=>{
        if(doctorInvestigations[key] === InvestigationID)
            toDetelekey = key
    })

    await set(ref(db,`users/${WhoLeaves}/ParticipatingInvestigations/${toDetelekey}`),null)
}