import { getDatabase, onValue, ref, set } from "firebase/database";
import { useEffect, useState } from "react";
import { app } from "../../../App";
import BlameButton from "./BlameButton";
import ResourceButton from "./ResourcesButton";
import { FaPlus } from "react-icons/fa";
import "../TreeDesign.css"
import { CreateNewTreeNode, DeleteNodeAndItsChildren } from "../InvestigationFirebaseFuncs";
import { IoPersonAddSharp } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
import { FaRegTrashAlt } from "react-icons/fa";
import AddDoctorInvestigationPopUp from "./AddDoctorInvestigationPopUp";
import TotalParticipatingDoctors from "./TotalParticipatingDoctors";

interface InvestigationNode {
    NodeCreationDate: string;
    RevelantFilesPath: string;//also the nodes ID as i remember the node relevant info through its ID
    EveryOneWhoEdited: string[];
    ChildrenNodes: { [key: string]: InvestigationNode };
}

interface InvestigationNodeWithDepth extends Omit<InvestigationNode, 'ChildrenNodes'> {
    vertical: number;
    horizontal: number;
    ChildrenNodesIds: string[]
    DataBaseFullPath: string;
}

const MultiplierX = 300
const MultiplierY = 120

const byDeafaultOffsetY = 300
const byDeafaultOffsetX = 30

const CalculatePos2D = (horizontal: number, vertical: number) => {
    return { x: horizontal * MultiplierX, y: vertical * MultiplierY }
}

const CalculateStartPathPoint = (horizontal: number, vertical: number) => {
    return { Startx: 180, Starty: 35 }
}

const CalculateEndPathPoint = (horizontal: number, vertical: number) => {
    return { Endx: MultiplierX, Endy: 35 + MultiplierY * vertical }
}

const drawSLine = (startX: number, startY: number, endX: number, endY: number) => {
    // Control points to make an S-curve
    const midX = (startX + endX) / 2;

    // Offset for control points to create the S-curve
    const offsetX = Math.abs(endX - startX) / 3; // Horizontal offset

    // Control points offset orthogonally to the midpoint
    const controlPoint1X = midX + offsetX;
    const controlPoint1Y = startY; // Above the midpoint

    const controlPoint2X = endX - offsetX;
    const controlPoint2Y = endY; // Below the midpoint


    // Cubic Bezier curve: M (move to) + C (cubic bezier curve)
    return `M${startX},${startY} C${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${endX},${endY}`;
};

const InvestigationTree = ({ InvestigationID, WhoAccesed, status }: { InvestigationID: string, WhoAccesed: string, status: string }) => {

    const [FlattenedTree, setFlattenedTree] = useState<{
        [key: string]: InvestigationNodeWithDepth;
    }>({});

    const [IsTreeEdit, setIsTreeEdit] = useState<boolean>(false)
    const [OpenAddDoctor, setOpenAddDoctor] = useState<boolean>(false)
    const [MainPathInvestigation, setMainPathInvestigation] = useState<string[]>([])
    const [LastNodeGoodPath, setLastNodeGoodPath] = useState<string>("")


    const TreeNodeComponents = ({ node, ID }: { node: InvestigationNodeWithDepth, ID: string }) => {

        const { x, y } = CalculatePos2D(node.horizontal, node.vertical)
        const { Startx, Starty } = CalculateStartPathPoint(node.horizontal, node.vertical)
        

        useEffect(() => {

            const getNodesFromPath = () => {
                // Regular expression to match UUIDs
                const uuidPattern = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g;

                // Find all matches
                const ids = node.DataBaseFullPath.match(uuidPattern) || [];

                // Output the extracted IDs
                console.log(ids);
                return ids
            }

            if (LastNodeGoodPath === ID && JSON.stringify(getNodesFromPath()) !== JSON.stringify(MainPathInvestigation)) {
                console.log(getNodesFromPath())
                setMainPathInvestigation(getNodesFromPath())
            }
        }, [ID])


        const ToChangeFocus = async (e:any)=>{
                if(status==="doctor")
                {
                    e.preventDefault()
                    e.stopPropagation()
                    const db = getDatabase(app)
                    set(ref(db,`Investigations/${InvestigationID}/LastAccurateNode`),ID)
                }
            }

        return <div
            key={ID}
            className={`tree-node ${MainPathInvestigation.includes(ID)?"illuminated":""}`}
            style={{ top: byDeafaultOffsetY + y, left: byDeafaultOffsetX + x, position: "absolute" }}
            onDoubleClick={ToChangeFocus}  
        >
            {node.ChildrenNodesIds.map((childKey: string) => {
                const { Endx, Endy } = CalculateEndPathPoint(FlattenedTree[childKey].horizontal, FlattenedTree[childKey].vertical - node.vertical)
                return <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, overflow: 'visible' }}>
                    <path
                        d={drawSLine(Startx, Starty, Endx, Endy)} // S-shaped curve
                        className="path"
                        strokeWidth="2"
                        fill="transparent"
                        style={{ color: 'linear-gradient(90deg, #4caf50, #8bc34a)' }}
                    />
                </svg>
            })
            }
            <BlameButton DoctorsWhoEdited={node.EveryOneWhoEdited} />
            <ResourceButton NodeID={ID} MasterID={InvestigationID} uid={WhoAccesed} NodeFullPath={node.DataBaseFullPath} EditMode={IsTreeEdit} status={status} />
            {status === "doctor" ? <div className="add-node-button" onClick={() => { CreateNewTreeNode(node.DataBaseFullPath, WhoAccesed) }}>
                <FaPlus />
            </div> : <></>}
            {IsTreeEdit && ID !== InvestigationID ? <div className="delete-tree-node-btn" onClick={() => {
                DeleteNodeAndItsChildren(node.DataBaseFullPath, InvestigationID, ID, FlattenedTree)
            }}>
                <FaRegTrashAlt />
            </div> : <></>}
            <div className="small-text node-text">Created on: {new Date(node.NodeCreationDate).toLocaleDateString()}</div>
        </div>
    }

    const FlattenTree = (root: InvestigationNode, rootID: string) => {
        if (!root) return {};

        const queue: {
            node: InvestigationNode;
            vertical: number;
            horizontal: number;
            ID: string;
            DaddyPath: string;
        }[] = [];

        queue.push({ node: root, vertical: 0, horizontal: 0, ID: rootID, DaddyPath: rootID });

        const levelCounter: { [key: number]: number } = {};
        const flattenedTree: { [key: string]: InvestigationNodeWithDepth } = {};

        while (queue.length > 0) {
            const { node, vertical, horizontal, ID, DaddyPath } = queue.shift()!;

            // Add child nodes to the queue
            const ListOfChildren: string[] = []
            try {
                Object.keys(node.ChildrenNodes).forEach((childkey: string) => {
                    if (!(horizontal + 1 in levelCounter)) levelCounter[horizontal + 1] = 0;

                    queue.push({
                        node: node.ChildrenNodes[childkey],
                        vertical: levelCounter[horizontal + 1],
                        horizontal: horizontal + 1,
                        ID: childkey,
                        DaddyPath: DaddyPath + '/ChildrenNodes/' + childkey
                    });

                    levelCounter[horizontal + 1]++;
                    ListOfChildren.push(childkey)
                });
            }
            catch (err) {
                console.log("no more children on node ", ID)
            }

            const { ChildrenNodes, ...rest } = node
            const newNode: InvestigationNodeWithDepth = {
                ...rest,
                vertical,
                horizontal,
                ChildrenNodesIds: ListOfChildren,
                DataBaseFullPath: DaddyPath
            };

            flattenedTree[ID] = newNode;

        }

        return flattenedTree;
    };

    useEffect(() => {
        const db = getDatabase(app);
        const unsub = onValue(ref(db, `InvestigationTrees/${InvestigationID}`), (snapshot) => {
            if (snapshot.exists()) {
                const treeData = snapshot.val();

                // Flatten the tree and update the state
                console.log(treeData)
                const flattened = FlattenTree(treeData, InvestigationID);
                console.log(flattened)
                setFlattenedTree(flattened);
            }
        });

        return () => unsub();
    }, [InvestigationID]);

    useEffect(() => {
        const db = getDatabase(app);
        const unsub = onValue(ref(db, `Investigations/${InvestigationID}/LastAccurateNode`), (snapshot) => {
            if (snapshot.exists())
                setLastNodeGoodPath(snapshot.val())
            else
                setLastNodeGoodPath("")
        });

        return () => unsub();
    }, [InvestigationID])

    if (Object.keys(FlattenedTree).length === 0) return <div>Cannot load Tree</div>;
    return <div className="right-panel" >
        <TotalParticipatingDoctors InvestigationID={InvestigationID} />
        {OpenAddDoctor ? <AddDoctorInvestigationPopUp onClose={() => { setOpenAddDoctor(false) }} WhoSent={WhoAccesed} IDinvestigation={InvestigationID} /> : <></>}
        {status === "doctor" ? <div style={{ position: 'sticky', top: '0px', left: "0px", display: 'flex', flexDirection: 'row', zIndex: '3000', padding: '10px', justifyContent: 'space-around', width: "100px" }}>
            <button className="fixed-add-button" onClick={() => { setOpenAddDoctor(true) }}><IoPersonAddSharp /></button>
            <button className="fixed-add-button" style={{ left: '50px' }} onClick={() => { setIsTreeEdit(!IsTreeEdit) }}><CiEdit /></button>
        </div> : <></>}
        {

            Object.keys(FlattenedTree).map((key: string) => {
                return <TreeNodeComponents node={FlattenedTree[key]} ID={key} />
            })
        }
        {/*<div style={{position:'absolute', top: '0px', right: '0px',width:'50xp',height:'50px',backgroundColor:'red' }}></div>*/}
        {/*<div style={{position:'absolute', bottom: '0px', left: '0px',height:'50px',width:'50px',backgroundColor:'red' }}></div>*/}
    </div>;
};

export default InvestigationTree;
