import AsyncStorage from '@react-native-async-storage/async-storage';
import { RateLimiter } from '../rateLimiter';
import { AUTH_RATE_LIMIT } from '../../config/environment';

jest.mock('@react-native-async-storage/async-storage');

describe('RateLimiter', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    const rateLimiter = RateLimiter.getInstance();
    await rateLimiter.clearAllLimits();
  });

  it('ar trebui să permită prima încercare', async () => {
    const rateLimiter = RateLimiter.getInstance();
    const result = await rateLimiter.checkRateLimit('test@example.com');
    expect(result).toBe(true);
  });

  it('ar trebui să blocheze după depășirea numărului maxim de încercări', async () => {
    const rateLimiter = RateLimiter.getInstance();
    const email = 'test@example.com';

    // Simulăm încercări multiple
    for (let i = 0; i < AUTH_RATE_LIMIT.MAX_ATTEMPTS; i++) {
      const result = await rateLimiter.checkRateLimit(email);
      expect(result).toBe(true);
    }

    // Următoarea încercare ar trebui să fie blocată
    const blocked = await rateLimiter.checkRateLimit(email);
    expect(blocked).toBe(false);
  });

  it('ar trebui să reseteze contorul după expirarea perioadei de timp', async () => {
    const rateLimiter = RateLimiter.getInstance();
    const email = 'test@example.com';

    // Simulăm încercări multiple
    for (let i = 0; i < AUTH_RATE_LIMIT.MAX_ATTEMPTS; i++) {
      await rateLimiter.checkRateLimit(email);
    }

    // Simulăm trecerea timpului
    jest.advanceTimersByTime(AUTH_RATE_LIMIT.WINDOW_MS + 1000);

    // Ar trebui să permită din nou
    const result = await rateLimiter.checkRateLimit(email);
    expect(result).toBe(true);
  });

  it('ar trebui să persiste datele în AsyncStorage', async () => {
    const rateLimiter = RateLimiter.getInstance();
    const email = 'test@example.com';

    await rateLimiter.checkRateLimit(email);

    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('ar trebui să încarce datele din AsyncStorage', async () => {
    const rateLimiter = RateLimiter.getInstance();
    const email = 'test@example.com';
    const mockData = {
      attempts: 1,
      timestamp: Date.now()
    };

    // Mock AsyncStorage pentru a returna date
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(mockData)
    );

    await rateLimiter.checkRateLimit(email);

    expect(AsyncStorage.getItem).toHaveBeenCalled();
  });

  it('ar trebui să reseteze limita pentru un email specific', async () => {
    const rateLimiter = RateLimiter.getInstance();
    const email = 'test@example.com';

    // Simulăm câteva încercări
    await rateLimiter.checkRateLimit(email);
    await rateLimiter.checkRateLimit(email);

    // Resetăm limita
    await rateLimiter.resetLimit(email);

    // Ar trebui să permită din nou
    const result = await rateLimiter.checkRateLimit(email);
    expect(result).toBe(true);
  });

  it('ar trebui să șteargă toate limitele', async () => {
    const rateLimiter = RateLimiter.getInstance();
    const emails = [
      'test1@example.com',
      'test2@example.com',
      'test3@example.com'
    ];

    // Simulăm încercări pentru mai multe email-uri
    for (const email of emails) {
      await rateLimiter.checkRateLimit(email);
    }

    // Ștergem toate limitele
    await rateLimiter.clearAllLimits();

    // Verificăm că toate email-urile pot fi încercate din nou
    for (const email of emails) {
      const result = await rateLimiter.checkRateLimit(email);
      expect(result).toBe(true);
    }
  });
});
