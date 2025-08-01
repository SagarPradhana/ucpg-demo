import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SendPage from "../Send";
import "@testing-library/jest-dom";

jest.mock("../../service/changeNowService", () => {
  return {
    getInstance: () => ({
      testApiConnectivity: jest.fn().mockResolvedValue(true),
      getFiatCurrencies: jest.fn().mockResolvedValue([{ ticker: "USD" }]),
      getCryptoCurrencies: jest
        .fn()
        .mockResolvedValue([{ ticker: "USDT", network: "ETH" }]),
      calculateCommission: jest.fn().mockReturnValue(1),
      calculateAmountAfterCommission: jest.fn().mockReturnValue(99),
      getFiatEstimate: jest.fn().mockResolvedValue({ toAmount: 100 }),
      getMarketInfo: jest
        .fn()
        .mockResolvedValue({ minAmount: 10, maxAmount: 1000 }),
      getOptimalExchangeRate: jest
        .fn()
        .mockResolvedValue({
          estimatedAmount: 99,
          rate: 1,
          networkFee: 0.01,
          serviceFee: 0.5,
        }),
      createFiatTransaction: jest
        .fn()
        .mockResolvedValue({
          id: "tx123",
          fromAmount: 100,
          fromCurrency: "USD",
        }),
      generateQRCodeData: jest.fn().mockReturnValue("qrcode"),
      generatePaymentLink: jest.fn().mockReturnValue("http://payment.link"),
      monitorTransactionWithPolling: jest
        .fn()
        .mockImplementation((id, type, callback) => {
          // Simulate transaction status updates
          setTimeout(() => callback("waiting", {}), 10);
          setTimeout(() => callback("processing", {}), 20);
          setTimeout(() => callback("finished", {}), 30);
          return Promise.resolve();
        }),
      validateAddress: jest.fn().mockResolvedValue({ result: true }),
      getSupportedPaymentMethods: jest
        .fn()
        .mockReturnValue([
          { value: "SEPA_1", label: "SEPA Transfer", icon: null },
        ]),
      createExchangeTransaction: jest.fn().mockResolvedValue({ id: "ex123" }),
      handleApiError: jest.fn().mockReturnValue({ message: "Error" }),
    }),
  };
});

describe("SendPage Component", () => {
  beforeEach(() => {
    localStorage.setItem("sessionToken", "token");
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("renders SendPage and initial step", async () => {
    render(
      <BrowserRouter>
        <SendPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Payment Progress/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue to Wallet Address/i)).toBeDisabled();

    // Enter valid amount to enable continue button
    fireEvent.change(screen.getByLabelText(/Amount/i), {
      target: { value: "100" },
    });
    await waitFor(() => {
      expect(screen.getByText(/Continue to Wallet Address/i)).toBeEnabled();
    });
  });

  test("redirects to login if no session token", () => {
    localStorage.removeItem("sessionToken");
    const mockNavigate = jest.fn();

    jest.mock("react-router-dom", () => ({
      ...jest.requireActual("react-router-dom"),
      useNavigate: () => mockNavigate,
    }));

    render(
      <BrowserRouter>
        <SendPage />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("proceeds through payment steps and handles transactions", async () => {
    jest.useFakeTimers();
    render(
      <BrowserRouter>
        <SendPage />
      </BrowserRouter>
    );

    // Enter amount and continue
    fireEvent.change(screen.getByLabelText(/Amount/i), {
      target: { value: "100" },
    });
    await waitFor(() => {
      expect(screen.getByText(/Continue to Wallet Address/i)).toBeEnabled();
    });
    fireEvent.click(screen.getByText(/Continue to Wallet Address/i));

    // Wait for fiat payment step to appear
    await waitFor(() => {
      expect(
        screen.getByText(/Complete your fiat payment/i)
      ).toBeInTheDocument();
    });

    // Show QR modal
    fireEvent.click(screen.getByText(/Show Payment QR Code/i));
    await waitFor(() => {
      expect(screen.getByText(/Payment QR Code/i)).toBeInTheDocument();
    });

    // Simulate payment confirmation by advancing timers
    act(() => {
      jest.advanceTimersByTime(50000);
    });

    // Wait for payment confirmation step
    await waitFor(() => {
      expect(screen.getByText(/Payment Received!/i)).toBeInTheDocument();
    });

    // Proceed to wallet input
    fireEvent.click(screen.getByText(/Enter Wallet Address/i));
    await waitFor(() => {
      expect(
        screen.getByLabelText(/Enter your USDT wallet address/i)
      ).toBeInTheDocument();
    });

    // Enter wallet address and validate
    fireEvent.change(screen.getByLabelText(/Enter your USDT wallet address/i), {
      target: { value: "0x1234567890abcdef" },
    });
    fireEvent.click(screen.getByText(/Validate Address/i));
    await waitFor(() => {
      expect(screen.getByText(/Wallet address is valid/i)).toBeInTheDocument();
    });

    // Convert and send crypto
    fireEvent.click(screen.getByText(/Convert & Send Crypto/i));
    await waitFor(() => {
      expect(screen.getByText(/Converting to Crypto/i)).toBeInTheDocument();
    });

    // Simulate exchange transaction completion
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Wait for completed step
    await waitFor(() => {
      expect(screen.getByText(/Transaction Completed!/i)).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  test("handles invalid wallet address", async () => {
    render(
      <BrowserRouter>
        <SendPage />
      </BrowserRouter>
    );

    // Move to wallet input step directly for test
    fireEvent.change(screen.getByLabelText(/Amount/i), {
      target: { value: "100" },
    });
    fireEvent.click(screen.getByText(/Continue to Wallet Address/i));
    await waitFor(() => screen.getByText(/Complete your fiat payment/i));
    // Simulate payment confirmed
    act(() => {
      // Directly set paymentConfirmed state by clicking through UI
      fireEvent.click(screen.getByText(/Show Payment QR Code/i));
    });

    // Enter invalid wallet address
    fireEvent.change(screen.getByLabelText(/Enter your USDT wallet address/i), {
      target: { value: "invalid_address" },
    });
    fireEvent.click(screen.getByText(/Validate Address/i));

    await waitFor(() => {
      expect(
        screen.getByText(/Please check your wallet address/i)
      ).toBeInTheDocument();
    });
  });
});
