import { Card } from 'react-bootstrap';
import styles from './ApporvalCardBox.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';

const ApprovalCard = () => {
    return (
        <Card bsPrefix={styles.CardDiv}>
            <Card border="secondary" className="m-1 mb-3 mt-3">
                <Card.Header>결재 대기 문서</Card.Header>
                <Card.Body>
                <h4>5</h4>
                </Card.Body>
            </Card>
            <Card border="secondary" className="m-1 mb-3 mt-3">
                <Card.Header>최근 결재 문서</Card.Header>
                <Card.Body>
                <h4>5</h4>
                </Card.Body>
            </Card>
            <Card border="secondary" className="m-1 mb-3 mt-3">
                <Card.Header>마감 임박 결재 문서</Card.Header>
                <Card.Body>
                <h4>5</h4>
                </Card.Body>
            </Card>
            <Card border="secondary" className="m-1 mb-3 mt-3" >
                <Card.Header>결재 시한 마감 문서</Card.Header>
                <Card.Body>
                <h4>5</h4>
                </Card.Body>
            </Card>
        </Card>
    );
}

export default ApprovalCard;