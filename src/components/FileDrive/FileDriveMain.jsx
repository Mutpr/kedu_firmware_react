import { Button } from "react-bootstrap";
import Header from "../Header/Header";
import SideBar from "../Sidebar/Sidebar";
import FileUploadMainContents from "./FileUploadMainContents";

const FileDrive = () => {
    return (
      <div className="app">
        <Header />
        <div className="container">
          <SideBar />
          <FileUploadMainContents/>
        </div>
      </div>
    );
  };

export default FileDrive;