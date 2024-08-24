import { Card } from 'react-bootstrap';
import style from './ApporvalCardBox.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';

const ApprovalCard = () => {
    return (
        <div className={style.CardDiv}>
            <Card style={{ display: 'flex', flexDirection: 'row' }}>
                <div className={style.CardMain}>
                    <Card style={{ width: '287px', height: '90px' }}>
                        
                        <Card.Body>
                            <Card.Text>
                                <h6>남은 휴가</h6>
                                <h3>5</h3>
                            </Card.Text>
                        </Card.Body>
                        
                    </Card>
                </div>
                <div className={style.CardMain}>
                    <Card style={{ width: '287px', height: '90px' }}>
                        <Card.Body>
                            <Card.Text>
                                <h6>총 출석 일수</h6>
                                <h3>5</h3>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>
                <div className={style.CardMain}>
                    <Card style={{ width: '287px', height: '90px', display:"flex"}} className={style.Card}>
                        <Card.Body>
                            <div>
                            <Card.Text>
                                <div>
                                <h6>결재 대기 중인 결재</h6>
                                </div>
                                <div style={{ display: "flex", alignItems: "center"}}>
                                    <h3>5</h3>
                                </div>
                            </Card.Text>
                            </div>
                        </Card.Body>
                    </Card>
                    
                </div>

                <div className={style.CardMain}>
                    <Card style={{ width: '287px', height: '90px' }}>
                        <Card.Body>
                            <Card.Text>
                                <h6>결재 완료된 결재</h6>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>
            </Card>
        </div>
    );
}

export default ApprovalCard;