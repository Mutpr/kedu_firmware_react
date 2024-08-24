import Header from "../Header/Header";
import SideBar from "../Sidebar/Sidebar";
import ApprovalMainContents from "./ApprovalMainContent/ApprovalMainContents";
const Approval = () => {
    return (
      <div className="app">
        <Header />
        <div className="container">
          <SideBar />
          <ApprovalMainContents/>
        </div>
      </div>
    );
  };

export default Approval;