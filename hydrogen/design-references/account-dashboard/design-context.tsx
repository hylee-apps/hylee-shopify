/**
 * DO NOT MODIFY — Raw Figma MCP output
 * Captured: 2026-03-23
 * File: Q541sIDD20eXqQSSozFUw4 (Account Pages)
 * Node: 2:530 (div.page-container)
 */

export default function DivPageContainer() {
  return (
    <div
      className="content-stretch flex flex-col items-start px-[360px] relative size-full"
      data-name="div.page-container"
      data-node-id="2:530"
    >
      <div
        className="content-stretch flex gap-[32px] items-start justify-center max-w-[1200px] px-[24px] py-[32px] relative shrink-0 w-full"
        data-name="div.account-layout"
        data-node-id="2:550"
      >
        <div
          className="bg-white border border-[#e5e7eb] border-solid content-stretch flex flex-col gap-[24px] items-start pb-[33px] pt-[25px] px-[25px] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 sticky top-0 w-[280px]"
          data-name="aside.account-sidebar"
          data-node-id="2:554"
        >
          {/* Avatar section with gradient circle, name, email */}
          <div
            className="border-[#e5e7eb] border-b border-solid h-[169px] relative shrink-0 w-full"
            data-name="div"
            data-node-id="2:555"
          >
            <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
              <div
                className="-translate-x-1/2 absolute content-stretch flex items-center justify-center left-1/2 rounded-[40px] size-[80px] top-0"
                data-name="div"
                data-node-id="2:556"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, rgb(38, 153, 166) 0%, rgb(43, 217, 168) 100%)',
                }}
              >
                <div
                  className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[32px] text-center text-white whitespace-nowrap"
                  data-node-id="2:557"
                >
                  <p className="leading-[48px]">JD</p>
                </div>
              </div>
              <div
                className="absolute content-stretch flex flex-col items-center left-0 right-0 top-[92px]"
                data-name="h3"
                data-node-id="2:558"
              >
                <div
                  className="flex flex-col font-['Roboto:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#1f2937] text-[18px] text-center whitespace-nowrap"
                  data-node-id="2:559"
                >
                  <p className="leading-[27px]">John Doe</p>
                </div>
              </div>
              <div
                className="absolute content-stretch flex flex-col items-center left-0 right-0 top-[123px]"
                data-name="p"
                data-node-id="2:560"
              >
                <div
                  className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#6b7280] text-[14px] text-center whitespace-nowrap"
                  data-node-id="2:561"
                >
                  <p className="leading-[21px]">john.doe@example.com</p>
                </div>
              </div>
            </div>
          </div>
          {/* Navigation items */}
          <div
            className="relative shrink-0 w-full"
            data-name="ul.account-nav"
            data-node-id="2:562"
          >
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative w-full">
              {/* Dashboard (active) */}
              <div
                className="bg-[rgba(38,153,166,0.1)] content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative rounded-[8px] shrink-0 w-full"
                data-name="Component 2"
                data-node-id="2:563"
              >
                <div className="content-stretch flex flex-col items-center relative shrink-0 w-[20px]">
                  <div className="flex flex-col font-['Font_Awesome_5_Free:Solid',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#2699a6] text-[15px] text-center whitespace-nowrap">
                    <p className="leading-[15px]">&#xf0e4;</p>
                  </div>
                </div>
                <div className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#2699a6] text-[15px] whitespace-nowrap">
                  <p className="leading-[22.5px]">Dashboard</p>
                </div>
              </div>
              {/* My Orders, Wishlist, Addresses, Payment Methods, Notifications, Settings - inactive */}
              {/* Sign Out - red, separated by border-t */}
            </div>
          </div>
        </div>
        <div
          className="content-stretch flex flex-col gap-[24px] items-start min-h-[600px] pb-[24px] relative shrink-0 w-[840px]"
          data-name="main.account-main"
          data-node-id="2:603"
        >
          {/* Welcome Banner */}
          <div
            className="content-stretch flex items-center p-[32px] relative rounded-[16px] shrink-0 w-full"
            style={{
              backgroundImage:
                'linear-gradient(134.9999979343113deg, rgb(38, 153, 166) 0%, rgb(43, 217, 168) 100%)',
            }}
          >
            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[349px]">
              <p className="text-[24px] font-light text-white leading-[36px]">
                Welcome back, John!
              </p>
              <p className="text-[16px] font-normal text-white opacity-90 leading-[24px]">
                Here&apos;s what&apos;s happening with your account today.
              </p>
            </div>
          </div>
          {/* Stats Row */}
          {/* Recent Orders Card */}
          {/* Saved for Later Card */}
        </div>
      </div>
    </div>
  );
}
