// DO NOT MODIFY — Raw Figma MCP output
// Captured: 2026-02-23
// Figma file: vzeR7m9jbWjAfD9EVlReyq (Cart and Checkout)
// Node: 327:989 (1920w light)

export default function Component1920WLight() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative size-full"
      data-name="1920w light"
      data-node-id="327:989"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgb(249, 250, 251) 0%, rgb(249, 250, 251) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)',
      }}
    >
      <div
        className="h-[1248.5px] min-h-[1200px] relative shrink-0 w-full"
        data-name="div.page-container"
        data-node-id="327:990"
      >
        <div
          className="absolute bg-white border-[#e5e7eb] border-b border-solid content-stretch flex gap-[8px] items-center justify-center left-0 pb-[25px] pt-[24px] right-0 top-[153px]"
          data-name="div.progress-steps"
          data-node-id="327:991"
        >
          {/* Step 1 - Cart (completed, checkmark) */}
          <div
            className="relative shrink-0"
            data-name="div.step"
            data-node-id="327:992"
          >
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative">
              <div
                className="bg-[#2699a6] content-stretch flex items-center justify-center relative rounded-[14px] shrink-0 size-[28px]"
                data-name="div.step-number"
                data-node-id="327:993"
              >
                {/* fa-check icon (checkmark) */}
              </div>
              <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[#2699a6] text-[14px] whitespace-nowrap">
                <p className="leading-[21px]">Cart</p>
              </div>
            </div>
          </div>
          {/* Divider (green - between completed and active) */}
          <div className="bg-[#2ac864] h-[2px] shrink-0 w-[40px]" />
          {/* Step 2 - Payment (active) */}
          <div
            className="relative shrink-0"
            data-name="div.step"
            data-node-id="327:1008"
          >
            <div className="content-stretch flex gap-[8px] items-center relative">
              <div
                className="bg-[#2ac864] content-stretch flex items-center justify-center relative rounded-[14px] shrink-0 size-[28px]"
                data-name="div.step-number"
                data-node-id="327:1009"
              >
                <p className="font-bold leading-[18px] text-[12px] text-white">
                  2
                </p>
              </div>
              <div className="flex flex-col font-medium justify-center leading-[0] relative shrink-0 text-[#2ac864] text-[14px] whitespace-nowrap">
                <p className="leading-[21px]">Payment</p>
              </div>
            </div>
          </div>
          {/* Divider (green - after active step) */}
          <div className="bg-[#2ac864] h-[2px] shrink-0 w-[40px]" />
          {/* Step 3 - Review (inactive) */}
          <div
            className="relative shrink-0"
            data-name="div.step"
            data-node-id="329:154"
          >
            <div className="content-stretch flex gap-[8px] items-center relative">
              <div className="bg-[#e5e7eb] content-stretch flex items-center justify-center relative rounded-[14px] shrink-0 size-[28px]">
                <p className="font-bold leading-[18px] text-[12px] text-[#4b5563]">
                  3
                </p>
              </div>
              <div className="flex flex-col font-medium justify-center relative shrink-0 text-[#9ca3af] text-[14px] whitespace-nowrap">
                <p className="leading-[21px]">Review</p>
              </div>
            </div>
          </div>
          {/* Divider (gray) */}
          <div className="bg-[#e5e7eb] h-[2px] shrink-0 w-[40px]" />
          {/* Step 4 - Review (inactive) */}
          <div
            className="relative shrink-0"
            data-name="div.step"
            data-node-id="327:1015"
          >
            <div className="content-stretch flex gap-[8px] items-center relative">
              <div className="bg-[#e5e7eb] content-stretch flex items-center justify-center relative rounded-[14px] shrink-0 size-[28px]">
                <p className="font-bold leading-[18px] text-[12px] text-[#4b5563]">
                  4
                </p>
              </div>
              <div className="flex flex-col font-medium justify-center relative shrink-0 text-[#9ca3af] text-[14px] whitespace-nowrap">
                <p className="leading-[21px]">Review</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div
          className="absolute content-stretch flex gap-[32px] items-start justify-center left-[384px] right-[384px] top-[262px]"
          data-name="div.checkout-layout"
          data-node-id="327:1020"
        >
          {/* Left column: 720px */}
          <div
            className="content-stretch flex flex-col gap-[24px] items-start pb-[24px] relative shrink-0 w-[720px]"
            data-name="div.main-content"
          >
            {/* Card 1: Payment Method */}
            <div
              className="bg-white border border-[#e5e7eb] border-solid rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-full"
              data-name="div.card"
              data-node-id="327:1022"
            >
              <div className="border-[#e5e7eb] border-b border-solid px-6 py-5">
                <h2 className="font-bold text-[#111827] text-[18px]">
                  Payment Method
                </h2>
              </div>
              <div className="flex flex-col gap-[12px] p-6">
                {/* Credit/Debit Card (selected) */}
                <div
                  className="bg-[rgba(38,153,166,0.05)] border-2 border-[#2699a6] flex gap-3 items-center p-[18px] rounded-[8px]"
                  data-node-id="327:1027"
                >
                  <div className="bg-white border border-[#2699a6] rounded-[50px] size-[20px] relative">
                    <div className="absolute bg-[#2699a6] left-[3px] rounded-[50px] size-[12px] top-1/2 -translate-y-1/2" />
                  </div>
                  <div className="bg-[#f3f4f6] h-[26px] rounded-[4px] w-[40px] flex items-center justify-center">
                    {/* credit-card icon */}
                  </div>
                  <span className="flex-1 text-[#1f2937] text-base">
                    Credit / Debit Card
                  </span>
                  <div className="flex gap-1 text-[#4b5563] text-2xl">
                    {/* Visa icon */}
                    {/* Mastercard icon */}
                  </div>
                </div>
                {/* Shop Pay */}
                <div
                  className="border-2 border-[#e5e7eb] flex gap-3 items-center p-[18px] rounded-[8px]"
                  data-node-id="327:1040"
                >
                  <div className="bg-white border border-[#767676] rounded-[50px] size-[20px]" />
                  <div className="bg-[#552bed] h-[26px] rounded-[4px] w-[40px] flex items-center justify-center">
                    {/* Shop Pay icon */}
                  </div>
                  <span className="flex-1 text-[#1f2937] text-base">
                    Shop Pay
                  </span>
                </div>
                {/* Apple Pay */}
                <div
                  className="border-2 border-[#e5e7eb] flex gap-3 items-center p-[18px] rounded-[8px]"
                  data-node-id="327:1047"
                >
                  <div className="bg-white border border-[#767676] rounded-[50px] size-[20px]" />
                  <div className="bg-black h-[26px] rounded-[4px] w-[40px] flex items-center justify-center">
                    {/* Apple icon */}
                  </div>
                  <span className="flex-1 text-[#1f2937] text-base">
                    Apple Pay
                  </span>
                </div>
                {/* Google Pay */}
                <div
                  className="border-2 border-[#e5e7eb] flex gap-3 items-center p-[18px] rounded-[8px]"
                  data-node-id="327:1054"
                >
                  <div className="bg-white border border-[#767676] rounded-[50px] size-[20px]" />
                  <div className="bg-[#4285f4] h-[26px] rounded-[4px] w-[40px] flex items-center justify-center">
                    {/* Google icon */}
                  </div>
                  <span className="flex-1 text-[#1f2937] text-base">
                    Google Pay
                  </span>
                </div>

                {/* Card Details (shown when Credit/Debit selected) */}
                <div
                  className="border-[#e5e7eb] border-solid border-t pt-6 space-y-4"
                  data-node-id="327:1061"
                >
                  <h4 className="font-semibold text-[#1f2937] text-base">
                    Card Details
                  </h4>
                  <div className="space-y-2">
                    <label className="font-medium text-[#374151] text-sm">
                      Card Number
                    </label>
                    <input
                      className="bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[13px] w-full text-[15px] placeholder:text-[#757575]"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="font-medium text-[#374151] text-sm">
                        Expiration Date
                      </label>
                      <input
                        className="bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[13px] w-full text-[15px] placeholder:text-[#757575]"
                        placeholder="MM / YY"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="font-medium text-[#374151] text-sm">
                        CVC
                      </label>
                      <input
                        className="bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[13px] w-full text-[15px] placeholder:text-[#757575]"
                        placeholder="123"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium text-[#374151] text-sm">
                      Name on Card
                    </label>
                    <input
                      className="bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[13px] w-full text-[15px] placeholder:text-[#757575]"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Billing Address */}
            <div
              className="bg-white border border-[#e5e7eb] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-full"
              data-node-id="327:1091"
            >
              <div className="border-[#e5e7eb] border-b border-solid px-6 py-5">
                <h2 className="font-bold text-[#111827] text-[18px]">
                  Billing Address
                </h2>
              </div>
              <div className="px-6 py-6">
                <label className="flex gap-3 items-center">
                  <div className="bg-[#2699a6] rounded-[2.5px] size-[18px]" />
                  <span className="text-[#1f2937] text-[15px]">
                    Same as shipping address
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary (400px, sticky) */}
          <div
            className="bg-white border border-[#e5e7eb] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 sticky top-0 w-[400px]"
            data-node-id="327:1102"
          >
            <div className="border-[#e5e7eb] border-b border-solid px-6 pb-[17px] pt-6">
              <h3 className="font-bold text-[#1f2937] text-[18px]">
                Order Summary
              </h3>
            </div>
            <div className="px-6 pt-[22px]">
              <div className="flex justify-between mb-[34.5px]">
                <span className="text-[#4b5563] text-[15px]">Subtotal</span>
                <span className="text-[#4b5563] text-[15px]">$426.00</span>
              </div>
              <div className="flex justify-between mb-[34.5px]">
                <span className="text-[#4b5563] text-[15px]">Shipping</span>
                <span className="text-[#4b5563] text-[15px]">$5.99</span>
              </div>
              <div className="flex justify-between mb-[34.5px]">
                <span className="text-[#4b5563] text-[15px]">Tax</span>
                <span className="text-[#4b5563] text-[15px]">$34.08</span>
              </div>
              <div className="border-[#e5e7eb] border-solid border-t-2 flex justify-between pt-[22px]">
                <span className="font-bold text-[#111827] text-[18px]">
                  Total
                </span>
                <span className="font-bold text-[#111827] text-[18px]">
                  $466.07
                </span>
              </div>
              {/* Review Order button */}
              <button className="bg-[#2699a6] flex gap-2 items-center justify-center mt-[22px] p-[16px] rounded-[8px] text-base font-semibold text-white w-full">
                Review Order →
              </button>
              {/* Return to Shipping */}
              <button className="flex gap-2 items-center justify-center p-[8px] rounded-[8px] text-[#2699a6] text-[15px] font-medium w-full">
                ← Return to Shipping
              </button>
              {/* Trust badges */}
              <div className="border-[#e5e7eb] border-solid border-t flex flex-col gap-[12px] pt-[25px] mt-[22px] pb-6">
                <div className="flex gap-2 items-center">
                  {/* lock icon green */}
                  <span className="text-[#4b5563] text-[13px]">
                    256-bit SSL Encryption
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  {/* shield icon green */}
                  <span className="text-[#4b5563] text-[13px]">
                    PCI Compliant
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
