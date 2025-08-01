import ChangeNowService from '../changeNowService';

describe('ChangeNowService', () => {
  const service = ChangeNowService.getInstance();

  test('testFiatEstimate should return a valid estimate', async () => {
    const estimate = await service.testFiatEstimate({
      from_currency: 'INR',
      from_amount: 1900,
      to_currency: 'USDT',
      to_network: 'ETH',
      deposit_type: 'SEPA_1',
      payout_type: 'SEPA_1',
    });

    expect(estimate).toBeDefined();
    expect(typeof estimate).toBe('object');
    expect(estimate).toHaveProperty('fromAmount');
    expect(estimate).toHaveProperty('toAmount');
    expect(estimate.fromAmount).toBe(1900);
  });
});
