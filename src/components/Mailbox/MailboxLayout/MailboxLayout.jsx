import Header from '../../Header/Header';
import SideBar from '../../Sidebar/Sidebar';

import CreateMail from '../CreateMail/CreateMail';
import MailContent from '../MailContent/MailContent';
import MailList from '../MailList/MailList';
import MailListActions from '../MailListActions/MailListActions';
import styles from './MailboxLayout.module.css'
import { Route, Routes } from 'react-router-dom';

const MailboxLayout = () => {
    return (
        <div className={styles.mailboxLayout}>

            <div className={styles.mailboxHeader}>
                <Header/>
            </div>
            
            <div className={styles.mailboxBody}> {/* Body */}
                <div className={styles.side}>
                    <SideBar/> 
                </div>
                <div className={styles.contentArea}>
                    <Routes>
                        <Route path="/" element={
                            <>
                                <div className={styles.mailListActions}>
                                    <MailListActions />
                                </div>
                                <div className={styles.mailArea}>
                                    <div className={styles.mailList}>
                                        <MailList/>
                                    </div>
                                    <div className={styles.mailContent}>
                                        <MailContent/>
                                    </div>
                                </div>
                            </>
                        }/>
                        
                        <Route path="compose" element={<CreateMail/>} />
                        
                    </Routes>
                </div>
                
            </div> {/* Body */}
        </div>
    )
}
export default MailboxLayout;