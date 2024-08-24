import { create } from 'zustand';
import axios from 'axios';

const serverUrl = process.env.REACT_APP_SERVER_URL;

export const useMailStore = create((set) => ({
  mails: { mails: [], total: 0 }, // 초기 상태를 객체로 설정
  // mails의 초기 상태가 빈 배열로 설정되었다가 이후 객체로 변환되는 일이 생긴다.
  // 상태를 항상 객체로 처리해야 문제가 생기지않는다.
  selectedMailContent: [],
  selectedMailSeq: null,

  setMails: (mails) => set({ mails }),
  setSelectedMailContent: (content) => set({ selectedMailContent: content }),
  setSelectedMailSeq: (seq) => set({ selectedMailSeq: seq }),

  handleGetAll: () => {
    console.log("모든 메일을 불러옵니다");
    axios.get(`${serverUrl}/mail`).then((resp) => { // 객체 배열 가져옴
      // 응답 데이터가 객체인지 확인하고, mails와 total을 설정
      if (resp.data && Array.isArray(resp.data.mails)) {
        set({
          mails: { mails: resp.data.mails, total: resp.data.total || resp.data.mails.length },
        });
      } else {
        set({ mails: { mails: [], total: 0 } });
      }
    });
  },

  handleGetPage: (page = 1, size = 10, sort = 'date_desc') => {
    console.log(`페이지 ${page}의 메일을 ${size}개 불러옵니다. 정렬: ${sort}`);
    axios.get(`${serverUrl}/mail`, { params: { page, size, sort } }).then((resp) => {
      if (resp.data && Array.isArray(resp.data.mails)) {
        set({
          mails: { mails: resp.data.mails, total: resp.data.total || resp.data.mails.length },
        });
      } else {
        set({ mails: { mails: [], total: 0 } });
      }
    })
    .catch((error) => {
      console.error("데이터 가져오기 실패:", error);
      set({ mails: { mails: [], total: 0 } }); // 실패 시 상태 초기화
    });
  },
}));

export const useUsersStore = create((set) => ({
  // Other user-related state management code...
}));
