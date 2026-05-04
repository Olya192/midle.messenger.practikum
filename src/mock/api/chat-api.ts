export const mockChatAPI = {
  getChats: jest.fn(),
  getChatToken: jest.fn(),
  getChatUsers: jest.fn(),
  createChat: jest.fn(),
  addUsersToChat: jest.fn(),
  deleteUsersFromChat: jest.fn(),
  deleteChat: jest.fn(),
};

export const ChatAPI = jest.fn().mockImplementation(() => mockChatAPI);
