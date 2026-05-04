export const mockUserAPI = {
  searchUsers: jest.fn(),
};

export const UserAPI = jest.fn().mockImplementation(() => mockUserAPI);
