import { getDatabase, push, ref as refdb, set } from "firebase/database";
import { app } from "../../App"
import { getStorage, uploadBytes, ref } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'

const getDate = () => {
    ///this is the random generated key for the path yes its the date it was created
    const today = new Date();
    const ss = String(today.getSeconds()).padStart(2, '0');
    const mimi = String(today.getMinutes()).padStart(2, '0');
    const hh = String(today.getHours()).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = String(today.getFullYear())

    return yyyy + mm + dd + hh + mimi + ss;
}

const uploadFiles = async (FormularPhotos: any[], RetetePhotos: any[], uploadTo: string, nameDoc: string, createdBy: string, language: string) => {

    const storage = getStorage(app)
    const database = getDatabase(app)
    const newFormkey = getDate()//path key

    if (createdBy !== uploadTo)//don't send yourself that you added a new doc i mean you added it so you should know you did that
        //send notification of a newly added doc
        await push(refdb(database, `users/${uploadTo}/notifs`), {
            date: new Date().toString(),
            from: createdBy,
            new: true,
            text: `${nameDoc} was added to your medical documents`,
            type: "NewDocMsg"
        })

    ///set the doc status to loading
    await set(refdb(database, "MedicalDocsStatus/" + `users/${uploadTo}/${newFormkey}`), "loading")

    const MetaData = {//the formed metadata
        nameDoc,
        createdBy,
        DocLanguage: language,
        creationYear: newFormkey.substring(0, 4),
        creationMonth: newFormkey.substring(4, 6),
        creationDay: newFormkey.substring(6, 8),
        creationHour: newFormkey.substring(8, 10),
        creationMinute: newFormkey.substring(10, 12),
        creationSecond: newFormkey.substring(12, 14),
    }

    try {
        //create blob and upload to storage the metadata in json format
        const blob = new Blob([JSON.stringify(MetaData)], { type: 'application/json' })
        await uploadBytes(ref(storage, `users/${uploadTo}/${newFormkey}/metadata`), blob)

        //upload medical related photos
        const uploadPromisesForm = FormularPhotos.map(async (file) => {
            await uploadBytes(ref(storage, `users/${uploadTo}/${newFormkey}/FormularPhotos/${uuidv4()}`), file)
        })

        await Promise.all(uploadPromisesForm)

        //upload recipes related photos
        const uploadPromisesRet = RetetePhotos.map(async (file) => {
            await uploadBytes(ref(storage, `users/${uploadTo}/${newFormkey}/RetetePhotos/${uuidv4()}`), file)
        })

        await Promise.all(uploadPromisesRet)

    } catch (error) {
        await set(refdb(database, "MedicalDocsStatus/" + `users/${uploadTo}/${newFormkey}`), "failed")
        ///should delete the whole tree cause corrupt
    }

    //again available to be seen with the changes made
    await set(refdb(database, "MedicalDocsStatus/" + `users/${uploadTo}/${newFormkey}`), "uploaded")
}

export default uploadFiles