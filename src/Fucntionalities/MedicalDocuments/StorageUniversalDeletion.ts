import { ref, listAll, deleteObject, getStorage } from "firebase/storage";
import { app } from "../../App";

//delete something in the storage even if its a folder or file
async function StorageUniversalDeletion(path:string) {

    const storage = getStorage(app)
    const storageRef = ref(storage, path);

    try {
        // Attempt to delete the path as a file
        await deleteObject(storageRef);
        console.log(`Successfully deleted file: ${path}`);
        return;
    } catch (error:any) {
        if (error.code === 'storage/object-not-found') {
            // Not a file, likely a directory; proceed to directory deletion
            console.log(`Path is not a file, attempting directory deletion: ${path}`);
        } else {
            console.error(`Error deleting file: ${path}`, error);
            return;
        }
    }

    try {
        // List all files and directories under the given path
        const result = await listAll(storageRef);

        // Delete all files in the current directory
        const deleteFilePromises = result.items.map((itemRef) => deleteObject(itemRef));
        await Promise.all(deleteFilePromises);

        // Recursively delete subdirectories
        const deleteFolderPromises = result.prefixes.map((folderRef) =>
            StorageUniversalDeletion(folderRef.fullPath)
        );
        await Promise.all(deleteFolderPromises);

        console.log(`Successfully deleted all content in path: ${path}`);
    } catch (error) {
        console.error(`Error deleting files from path: ${path}`, error);
    }
}

export default StorageUniversalDeletion