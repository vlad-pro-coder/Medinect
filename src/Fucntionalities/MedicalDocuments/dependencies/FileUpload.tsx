import { useRef } from 'react';
import { IoIosRemoveCircleOutline } from "react-icons/io";

///the blueprint for a file upload click or drag and drop for files area
const FileUpload = ({ selectedFiles, setSelectedFiles, children }: any) => {
  const inputRef = useRef<any>(null);

  //remove the clicked file
  const removeFile = (indexToRemove: number) => {
    setSelectedFiles((prev: File[]) => {
      return prev.filter((_, indexfil: number) => { return indexfil !== indexToRemove })
    })
  }

  //handle new added files by adding them to the list
  const handleFiles = (files: any) => {
    const filesArray = Array.from(files);
    setSelectedFiles((prevFiles: any) => [...prevFiles, ...filesArray]);
  };
  //action for files when added
  const handleInputChange = (event: any) => {
    handleFiles(event.target.files);
  };

  //handle files if dropped
  const handleDrop = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    handleFiles(files);
  };

  //stops things from rerendering when hovering over
  const handleDragOver = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
  };

  ///a simple input in which you can click and select files or drag and drop over the specific areas
  return (
    <div style={{ maxHeight: '200px',width:'46%' }}>
      <input
        type="file"
        multiple
        ref={inputRef}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
      <div
        onClick={() => inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: '2px dashed #cccccc',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          height: '100px'
        }}
      >
        {children}
      </div>
      <ul style={{ overflowY: 'auto', maxHeight: "100px" }}>
        {selectedFiles.map((file: any, index: number) => (
          <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flexGrow: 1,
              marginRight: "10px"
            }}>{file.name}</div>
            <button className='delete-option' onClick={() => { removeFile(index) }}><IoIosRemoveCircleOutline /></button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileUpload;
