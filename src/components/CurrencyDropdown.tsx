import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, Search, Check } from "lucide-react";
import { ChangeNowFiatCurrency, ChangeNowCryptoCurrency } from "@/types";

interface CurrencyDropdownProps {
  currencies: (ChangeNowFiatCurrency | ChangeNowCryptoCurrency)[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type: "fiat" | "crypto";
  className?: string;
}

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
  currencies,
  selectedValue,
  onSelect,
  placeholder = "Select currency",
  disabled = false,
  type,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 350,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position - Always position below the trigger
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Always position below the trigger with 4px gap
      let top = triggerRect.bottom + scrollTop + 4;
      let left = triggerRect.left + scrollLeft;
      const dropdownWidth = Math.max(triggerRect.width, 300);

      // Calculate available space below
      const spaceBelow = viewportHeight - triggerRect.bottom - 20; // 20px buffer
      const maxDropdownHeight = Math.max(200, Math.min(350, spaceBelow));

      // Ensure dropdown doesn't go off the right edge of viewport
      if (left + dropdownWidth > viewportWidth - 10) {
        left = Math.max(10, viewportWidth - dropdownWidth - 10);
      }

      // Ensure dropdown doesn't go off the left edge
      if (left < 10) {
        left = 10;
      }

      // Ensure dropdown stays within viewport bounds
      const maxTop = Math.max(triggerRect.bottom + scrollTop + 4, 10);

      setDropdownPosition({
        top: maxTop,
        left,
        width: dropdownWidth,
        maxHeight: maxDropdownHeight,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside and handle window resize
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (isOpen && triggerRef.current) {
        // Recalculate position on window resize
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft =
          window.pageXOffset || document.documentElement.scrollLeft;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        let top = triggerRect.bottom + scrollTop + 4;
        let left = triggerRect.left + scrollLeft;
        const dropdownWidth = Math.max(triggerRect.width, 300);
        const spaceBelow = viewportHeight - triggerRect.bottom - 20;
        const maxDropdownHeight = Math.max(200, Math.min(350, spaceBelow));

        if (left + dropdownWidth > viewportWidth - 10) {
          left = Math.max(10, viewportWidth - dropdownWidth - 10);
        }
        if (left < 10) {
          left = 10;
        }

        setDropdownPosition({
          top: Math.max(triggerRect.bottom + scrollTop + 4, 10),
          left,
          width: dropdownWidth,
          maxHeight: maxDropdownHeight,
        });
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        handleResize(); // Use same logic for scroll events
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  // Filter currencies based on search term
  const filteredCurrencies = currencies.filter((currency) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      currency.ticker.toLowerCase().includes(searchLower) ||
      currency.name.toLowerCase().includes(searchLower)
    );
  });

  // Get unique crypto currencies (for crypto type)
  const uniqueCurrencies =
    type === "crypto"
      ? Array.from(
          new Map(
            (currencies as ChangeNowCryptoCurrency[]).map((c) => [
              c.ticker.toUpperCase(),
              c,
            ])
          ).values()
        )
      : currencies;

  const displayCurrencies =
    type === "crypto" ? uniqueCurrencies : filteredCurrencies;

  const selectedCurrency = currencies.find((c) =>
    type === "crypto"
      ? c.ticker.toUpperCase() === selectedValue
      : c.ticker === selectedValue
  );

  const handleSelect = (
    currency: ChangeNowFiatCurrency | ChangeNowCryptoCurrency
  ) => {
    const value =
      type === "crypto" ? currency.ticker.toUpperCase() : currency.ticker;
    onSelect(value);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <Button
        ref={triggerRef}
        variant="outline"
        className="w-full justify-between h-10 px-3 py-2 text-left font-normal"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedCurrency ? (
            <>
              {selectedCurrency.image && (
                <img
                  src={selectedCurrency.image}
                  alt={selectedCurrency.ticker}
                  className="w-5 h-5 rounded-full flex-shrink-0"
                />
              )}
              <span className="truncate">
                {type === "crypto"
                  ? selectedCurrency.ticker.toUpperCase()
                  : selectedCurrency.ticker}{" "}
                - {selectedCurrency.name}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {/* Dropdown Modal */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-50 shadow-lg rounded-lg border border-border"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            maxWidth: "400px",
            maxHeight: dropdownPosition.maxHeight,
            transform: "translateY(0)", // Ensure it's positioned at bottom
          }}
        >
          <Card className="border border-border bg-background h-full flex flex-col">
            <CardContent className="p-0 flex flex-col h-full min-h-0">
              {/* Search Input */}
              <div className="p-3 border-b flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${
                      type === "fiat" ? "currencies" : "cryptocurrencies"
                    }...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9"
                    autoFocus
                  />
                </div>
              </div>

              {/* Currency List */}
              <div
                className="flex-1 overflow-y-auto min-h-0"
                style={{
                  maxHeight: Math.max(150, dropdownPosition.maxHeight - 100),
                }}
              >
                <div className="p-1">
                  {displayCurrencies.length === 0 ? (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      No currencies found
                    </div>
                  ) : (
                    displayCurrencies.map((currency) => {
                      const currencyValue =
                        type === "crypto"
                          ? currency.ticker.toUpperCase()
                          : currency.ticker;
                      const isSelected = currencyValue === selectedValue;

                      return (
                        <Button
                          key={`${currency.ticker}-${
                            type === "crypto"
                              ? (currency as ChangeNowCryptoCurrency).network
                              : ""
                          }`}
                          variant="ghost"
                          className="w-full justify-start h-auto p-3 hover:bg-accent"
                          onClick={() => handleSelect(currency)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            {currency.image && (
                              <img
                                src={currency.image}
                                alt={currency.ticker}
                                className="w-6 h-6 rounded-full flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 text-left">
                              <div className="font-medium">{currencyValue}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {currency.name}
                              </div>
                              {type === "crypto" &&
                                (currency as ChangeNowCryptoCurrency)
                                  .isStable && (
                                  <div className="text-xs text-green-600 mt-1">
                                    Stablecoin
                                  </div>
                                )}
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </Button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Popular/Featured Section for Crypto */}
              {type === "crypto" && searchTerm === "" && (
                <div className="border-t p-3 flex-shrink-0">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Popular Cryptocurrencies
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {["USDT", "BTC", "ETH", "BNB", "USDC"].map((ticker) => {
                      const currency = currencies.find(
                        (c) => c.ticker.toUpperCase() === ticker
                      );
                      if (!currency) return null;

                      return (
                        <Button
                          key={ticker}
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleSelect(currency)}
                        >
                          {ticker}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CurrencyDropdown;
