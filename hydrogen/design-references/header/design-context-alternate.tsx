/**
 * FIGMA DESIGN REFERENCE — DO NOT MODIFY
 *
 * Raw output from Figma MCP `get_design_context` for Header Alternate variant.
 * This file is an immutable reference for comparing against the implementation.
 *
 * Source: https://www.figma.com/design/eWh354xJwjwpuedg2yjkFl/Home---Nav---Project-Launch?node-id=4569-170
 * Captured: 2026-02-15
 * Variant: Header=Alternate (Non-homepage)
 * File: eWh354xJwjwpuedg2yjkFl (Home - Nav - Project Launch)
 */

const imgIcon =
  'https://www.figma.com/api/mcp/asset/5df5b140-e896-4dca-a6ab-c7ec2e9c77f9';
const imgEllipse3 =
  'https://www.figma.com/api/mcp/asset/67181867-432f-483d-af5b-d82c52c5fd35';
const imgLine1 =
  'https://www.figma.com/api/mcp/asset/1126762f-5943-4dc0-9cef-08d049a7c601';
const imgLogoCondensedDefault =
  'https://www.figma.com/api/mcp/asset/ead971eb-6b8f-468c-8811-9389adea6b37';
const imgFrame21 =
  'https://www.figma.com/api/mcp/asset/8ec1dd0b-4696-4b17-b591-7a7d1b3ada86';
const imgVector =
  'https://www.figma.com/api/mcp/asset/64ea73e9-82db-4283-ae33-e589c68a75a4';

function Logo({className}: {className?: string}) {
  return (
    <div className={className || ''} data-name="Logo" data-node-id="4569:271">
      <div
        className="h-[50px] relative w-[65px]"
        data-name="Logo=CondensedDefault"
        data-node-id="4213:235"
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-contain pointer-events-none size-full"
          src={imgLogoCondensedDefault}
        />
      </div>
    </div>
  );
}

function Header({className}: {className?: string}) {
  return (
    <div className={className || ''} data-name="Header" data-node-id="4150:66">
      <div
        className="bg-white border-[var(--primary,#2ac864)] border-b border-solid content-stretch flex flex-col items-start px-[122px] py-[14px] relative w-[1440px]"
        data-name="Header=Alternate"
        data-node-id="4569:170"
      >
        <div
          className="content-stretch flex gap-[26px] items-center relative shrink-0"
          data-node-id="4569:718"
        >
          {/* Left group: logo + hamburger + search (948px, gap-15) */}
          <div
            className="content-stretch flex gap-[15px] items-center justify-center relative shrink-0 w-[948px]"
            data-node-id="4569:171"
          >
            <Logo className="h-[50px] relative shrink-0 w-[65px]" />
            {/* Hamburger button (40x40, border-1 secondary, rounded-6) */}
            <div
              className="bg-[rgba(0,0,0,0)] border border-[var(--secondary,#2699a6)] border-solid content-stretch flex flex-col items-center justify-center px-[8px] py-[11px] relative rounded-[6px] shrink-0 size-[40px]"
              data-name="Button"
              data-node-id="4569:249"
            >
              {/* 3-line menu icon 24x16 */}
              <div className="h-[16px] relative shrink-0 w-[24px]">
                <img
                  alt=""
                  className="block max-w-none size-full"
                  src={imgFrame21}
                />
              </div>
            </div>
            {/* Search input (flex-1, h-40, border-1 secondary, rounded-25) */}
            <div
              className="bg-white border border-[var(--secondary,#2699a6)] border-solid content-stretch flex flex-[1_0_0] h-[40px] items-center justify-between min-h-px min-w-px px-[13px] py-[10px] relative rounded-[25px]"
              data-name="Input"
            >
              <div className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[rgba(0,0,0,0.5)] text-center whitespace-nowrap">
                <p>Placeholder text</p>
              </div>
              {/* Magnifier icon ~28x29 */}
            </div>
          </div>
          {/* Right group: My Orders + Account + Cart (222px, justify-between) */}
          <div
            className="content-stretch flex items-center justify-between relative shrink-0 w-[222px]"
            data-node-id="4569:174"
          >
            {/* My Orders dropdown (80px, chevron) */}
            <div
              className="bg-[rgba(42,200,100,0)] content-stretch flex h-[40px] items-center justify-center px-[16px] py-[10px] relative rounded-[8px] shrink-0 w-[80px]"
              data-name="Link"
              data-node-id="4569:175"
            >
              <div className="content-stretch flex gap-[2px] items-center justify-center relative shrink-0">
                <div className="font-['Inter:Medium',sans-serif] font-medium text-[#666] text-[14px] text-center whitespace-nowrap">
                  <p>Link</p>
                </div>
                {/* Chevron icon 10x10 */}
              </div>
            </div>
            {/* Account (plain link) */}
            <div
              className="bg-[rgba(42,200,100,0)] content-stretch flex h-[40px] items-center justify-center px-[16px] py-[10px] relative rounded-[8px] shrink-0"
              data-name="Link"
              data-node-id="4569:628"
            >
              <div className="font-['Inter:Medium',sans-serif] font-medium text-[#666] text-[14px] text-center whitespace-nowrap">
                <p>Link</p>
              </div>
            </div>
            {/* Cart (54px wide, 40px tall, icon + badge) */}
            <div
              className="h-[40px] relative rounded-[8px] shrink-0 w-[54px]"
              data-node-id="4248:302"
            >
              {/* Cart icon 40x40, offset left-8 top-7 */}
              <div className="absolute left-[8px] overflow-clip size-[40px] top-[7px]">
                {/* icon content */}
              </div>
              {/* Badge: 10x10, white bg, rounded-7, text-8px black */}
              <div className="absolute bg-white content-stretch flex flex-col items-center justify-center left-[42px] px-[4px] py-[2px] rounded-[7px] size-[10px] top-[3px]">
                <div className="font-['Inter:Medium',sans-serif] font-medium text-[8px] text-black text-center whitespace-nowrap">
                  <p>2</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeaderAlternate() {
  return <Header />;
}
