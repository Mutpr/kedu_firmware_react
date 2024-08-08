import ApprovalCardBox from "../ApprovalCardBox/ApprovalCardBox";
import ApprovalModal from "../ApprovalModal/ApprovalModal";
import style from './ApprovalMainContent.module.css';
import { Card } from 'react-bootstrap';
const ApprovalMainContents = () => {

    return (
        <div className={style.grid_container}>
            <ApprovalCardBox />
            <div>
                <Card>
                    <Card.Body>
                        <h1 style={{ display: "flex", justifyContent: "flex-start" }}>전자결재창</h1>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <ApprovalModal />
                        </div>
                    </Card.Body>
                </Card>
            </div>
            <div>
                <Card>
                    <Card.Body>
                        <h3 style={{ display: "flex", justifyContent: "flex-start" }}>전자결재창</h3>
                    </Card.Body>
                </Card>
            </div>
            <div>
                <Card>
                    <Card.Body>
                        <h3 style={{ display: "flex", justifyContent: "flex-start" }}>전자결재창</h3>
                    </Card.Body>
                </Card>
            </div>
            <div>
                <Card>
                    <Card.Body>
                        <h3 style={{ display: "flex", justifyContent: "flex-start" }}>전자결재창</h3>
                    </Card.Body>
                </Card>
            </div>
            <div>
                <Card>
                    <Card.Body>
                        <h3 style={{ display: "flex", justifyContent: "flex-start" }}>전자결재창</h3>
                    </Card.Body>
                </Card>
            </div>
            <div>
                <Card>
                    <Card.Body>
                        <h3 style={{ display: "flex", justifyContent: "flex-start" }}>전자결재창</h3>
                    </Card.Body>
                </Card>
            </div>
            
        </div>
    );
}

export default ApprovalMainContents;