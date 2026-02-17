/**
 * FIGMA DESIGN REFERENCE — DO NOT MODIFY
 *
 * Raw output from Figma MCP `get_design_context` for Header Main variant.
 * This file is an immutable reference for comparing against the implementation.
 *
 * Source: https://www.figma.com/design/eWh354xJwjwpuedg2yjkFl/Home---Nav---Project-Launch?node-id=4150-67
 * Captured: 2026-02-15
 * Variant: Header=Main (Homepage)
 * File: eWh354xJwjwpuedg2yjkFl (Home - Nav - Project Launch)
 */

const imgVector =
  'https://www.figma.com/api/mcp/asset/dd1e6319-f84e-4f07-a897-ec0cf4b53c60';
const imgLogoCondensedDefault =
  'https://www.figma.com/api/mcp/asset/5563b6c8-bf67-4ed4-a368-3ba7eb43c710';

function MenuMain({className}: {className?: string}) {
  return (
    <div
      className={
        className || 'content-stretch flex items-center relative'
      }
      data-name="Menu, Main"
      data-node-id="4567:100"
    >
      <div
        className="content-stretch flex items-center overflow-clip relative shrink-0"
        data-node-id="4567:81"
      >
        <div
          className="content-stretch flex gap-[10px] items-center relative shrink-0"
          data-node-id="4567:82"
        >
          {/* Link 1: Categories dropdown (80px wide, chevron) */}
          <div
            className="bg-[rgba(42,200,100,0)] content-stretch flex h-[40px] items-center justify-center px-[16px] py-[10px] relative rounded-[8px] shrink-0 w-[80px]"
            data-name="Link"
            data-node-id="4567:83"
          >
            <div className="content-stretch flex gap-[2px] items-center justify-center relative shrink-0">
              <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#666] text-[14px] text-center whitespace-nowrap">
                <p className="leading-[normal]">Link</p>
              </div>
              {/* Chevron icon 10x10 */}
            </div>
          </div>
          {/* Links 2-4: Plain links (What's New, Blog & Media, Blog & Media) */}
          <div
            className="bg-[rgba(42,200,100,0)] content-stretch flex h-[40px] items-center justify-center px-[16px] py-[10px] relative rounded-[8px] shrink-0"
            data-name="Link"
          >
            <div className="font-['Inter:Medium',sans-serif] font-medium text-[#666] text-[14px] text-center whitespace-nowrap">
              <p>Link</p>
            </div>
          </div>
          <div
            className="bg-[rgba(42,200,100,0)] content-stretch flex h-[40px] items-center justify-center px-[16px] py-[10px] relative rounded-[8px] shrink-0"
            data-name="Link"
          >
            <div className="font-['Inter:Medium',sans-serif] font-medium text-[#666] text-[14px] text-center whitespace-nowrap">
              <p>Link</p>
            </div>
          </div>
          <div
            className="bg-[rgba(42,200,100,0)] content-stretch flex h-[40px] items-center justify-center px-[16px] py-[10px] relative rounded-[8px] shrink-0"
            data-name="Link"
          >
            <div className="font-['Inter:Medium',sans-serif] font-medium text-[#666] text-[14px] text-center whitespace-nowrap">
              <p>Link</p>
            </div>
          </div>
          {/* Link 5: EN dropdown (80px wide, chevron) */}
          <div
            className="bg-[rgba(42,200,100,0)] content-stretch flex h-[40px] items-center justify-center px-[16px] py-[10px] relative rounded-[8px] shrink-0 w-[80px]"
            data-name="Link"
          >
            <div className="content-stretch flex gap-[2px] items-center justify-center relative shrink-0">
              <div className="font-['Inter:Medium',sans-serif] font-medium text-[#666] text-[14px] text-center whitespace-nowrap">
                <p>Link</p>
              </div>
              {/* Chevron icon 10x10 */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        className="bg-white content-stretch flex flex-col h-[79px] items-center justify-center px-[122px] py-[10px] relative w-[1440px]"
        data-name="Header=Main"
        data-node-id="4150:67"
      >
        <div
          className="content-stretch flex gap-[185px] items-center px-[122px] py-[4px] relative shrink-0 w-[1440px]"
          data-node-id="4150:68"
        >
          <Logo className="h-[50px] relative shrink-0 w-[65px]" />
          <MenuMain className="content-stretch flex items-center overflow-clip relative shrink-0" />
          {/* Right actions: Sign In + Register (166px) */}
          <div
            className="content-stretch flex items-center justify-between relative shrink-0 w-[166px]"
            data-node-id="4150:69"
          >
            {/* Sign In (plain link) */}
            <div
              className="bg-[rgba(42,200,100,0)] content-stretch flex h-[40px] items-center justify-center px-[16px] py-[10px] relative rounded-[8px] shrink-0"
              data-name="Link"
              data-node-id="4150:70"
            >
              <div className="font-['Inter:Medium',sans-serif] font-medium text-[#666] text-[14px] text-center whitespace-nowrap">
                <p>Link</p>
              </div>
            </div>
            {/* Register (border-secondary, text-secondary) */}
            <div
              className="bg-[rgba(0,0,0,0)] border border-[var(--secondary,#2699a6)] border-solid content-stretch flex h-[40px] items-center justify-center px-[16px] py-[10px] relative rounded-[8px] shrink-0"
              data-name="Link"
              data-node-id="4150:71"
            >
              <div className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[color:var(--secondary,#2699a6)] text-center whitespace-nowrap">
                <p>Link</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeaderMain() {
  return <Header />;
}
