import FileUploadModal from "./FileDriveModule/FileUploadModal";
const FileUploadMainContents = () => {

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <FileUploadModal />
            </div>
        </div>
    );
}

export default FileUploadMainContents;