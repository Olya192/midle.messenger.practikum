export const mockAuthAPI = {
  getUser: jest.fn(),
};

export const AuthAPI = jest.fn().mockImplementation(() => mockAuthAPI);
