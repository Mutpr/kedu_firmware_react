import { Route, Routes } from 'react-router-dom';
import Header from '../../Header/Header';
import SideBar from '../../Sidebar/Sidebar';
import styles from './AttendanceLayout.module.css';
import AttendanceManagement from '../AttendanceManagement/AttendanceManagement';
import AttendanceManagementAction from '../AttendanceManagementAction/AttendanceManagementAction';
import AttendanceCardBox from '../AttendanceCardBox/AttendanceCardBox';
import DeptSchedule from '../DeptSchedule/DeptSchedule';

const AttendanceLayout = () => {
    return (
        <div className={styles.attendanceLayout}>
            <div className={styles.attendanceHeader}>
                <Header />
            </div>
            <div className={styles.attendanceBody}> {/* Body */}
                <div className={styles.side}>
                    <SideBar />
                </div>
                <div className={styles.contentArea}>
                    <div className={styles.contents}>
                        <div>
                            <AttendanceManagementAction/>
                        </div>
                        <div>
                            <Routes>
                                <Route path="/" element={ //근태 현황
                                    <>
                                    <AttendanceCardBox />
                                    <AttendanceManagement />
                                    </>
                                    } />
                                <Route path="deptschedule" element={ //구성원 근무
                                    <DeptSchedule/>
                                }/>
                            </Routes>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceLayout;
