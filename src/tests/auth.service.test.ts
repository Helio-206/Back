import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../services/auth.service';
import api from '../services/api';

// Mock axios
vi.mock('../services/api');

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const mockResponse = {
        access_token: 'jwt-token-123',
        user: {
          id: 'user-1',
          email: 'user@gov.ao',
          role: 'USER',
          cidadao: {
            id: 'cidadao-1',
            nome: 'João',
            sobrenome: 'Silva',
            bi: '009593845LA0444',
            dataNascimento: '1990-01-15',
          },
        },
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.login({
        email: 'user@gov.ao',
        password: 'StrongPass123',
      });

      expect(result.access_token).toBe('jwt-token-123');
      expect(result.user.email).toBe('user@gov.ao');
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'user@gov.ao',
        password: 'StrongPass123',
      });
    });

    it('should handle login error', async () => {
      const error = new Error('Invalid credentials');
      vi.mocked(api.post).mockRejectedValueOnce(error);

      await expect(
        authService.login({
          email: 'user@gov.ao',
          password: 'WrongPass',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should register with valid data', async () => {
      const mockResponse = {
        access_token: 'jwt-token-456',
        user: {
          id: 'user-2',
          email: 'newuser@gov.ao',
          role: 'USER',
          cidadao: {
            id: 'cidadao-2',
            nome: 'Maria',
            sobrenome: 'Santos',
            bi: '123456789AB5678',
            dataNascimento: '1995-05-20',
          },
        },
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.register({
        email: 'newuser@gov.ao',
        password: 'NewPass123',
        cidadao: {
          nome: 'Maria',
          sobrenome: 'Santos',
          bi: '123456789AB5678',
          dataNascimento: '1995-05-20',
        },
      });

      expect(result.access_token).toBe('jwt-token-456');
      expect(result.user.email).toBe('newuser@gov.ao');
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        email: 'newuser@gov.ao',
        password: 'NewPass123',
        cidadao: {
          nome: 'Maria',
          sobrenome: 'Santos',
          bi: '123456789AB5678',
          dataNascimento: '1995-05-20',
        },
      });
    });

    it('should handle register error', async () => {
      const error = new Error('Email already registered');
      vi.mocked(api.post).mockRejectedValueOnce(error);

      await expect(
        authService.register({
          email: 'existing@gov.ao',
          password: 'StrongPass123',
          cidadao: {
            nome: 'Test',
            sobrenome: 'User',
            bi: '111111111AA1111',
          },
        })
      ).rejects.toThrow('Email already registered');
    });
  });
});
