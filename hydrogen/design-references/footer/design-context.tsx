/**
 * FIGMA DESIGN REFERENCE — DO NOT MODIFY
 *
 * Raw output from Figma MCP `get_design_context` for Footer.
 * This file is an immutable reference for comparing against the implementation.
 *
 * Source: https://www.figma.com/design/eWh354xJwjwpuedg2yjkFl/Home---Nav---Project-Launch?node-id=1796-105
 * Captured: 2026-02-17
 * File: eWh354xJwjwpuedg2yjkFl (Home - Nav - Project Launch)
 */

const imgLogoDefault =
  'https://www.figma.com/api/mcp/asset/54503fb0-99e4-4cf3-ac7c-416cfd8f4bdf';

function Input({className}: {className?: string}) {
  return (
    <div className={className || ''} data-name="Input" data-node-id="4551:188">
      <div
        className="bg-white border border-[var(--secondary,#2699a6)] border-solid h-[41px] min-w-[270px] relative rounded-[25px] w-[270px]"
        data-name="Property 1=Submit"
        data-node-id="4551:189"
      >
        <div
          className="absolute content-stretch flex items-center justify-between left-[9px] top-0 w-[370px]"
          data-node-id="4569:431"
        >
          <div className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[rgba(0,0,0,0.5)] text-center w-[110px]">
            <p>Placeholder text</p>
          </div>
          <div
            className="bg-[var(--secondary,#2699a6)] content-stretch flex flex-col h-[40px] items-center justify-center px-[26px] py-[10px] relative rounded-[25px] shrink-0 w-[100px]"
            data-name="Button"
            data-node-id="4569:352"
          >
            <div className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-center text-white whitespace-nowrap">
              <p>Submit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaIconSocial({className}: {className?: string}) {
  return (
    <div
      className={className || 'relative size-[20px]'}
      data-name="Media Icon, Social"
      data-node-id="799:55"
    >
      <div
        className="absolute bg-black inset-0 opacity-20"
        data-node-id="797:72"
      />
    </div>
  );
}

function Logo({className}: {className?: string}) {
  return (
    <div className={className || ''} data-name="Logo" data-node-id="4569:271">
      <div
        className="h-[101.865px] relative w-[183px]"
        data-name="Logo=Default"
        data-node-id="830:59"
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          src={imgLogoDefault}
        />
      </div>
    </div>
  );
}

export default function Footer({className}: {className?: string}) {
  return (
    <div
      className={
        className ||
        'bg-white content-stretch flex flex-col items-start px-[122px] py-[59px] relative w-[1440px]'
      }
      data-name="Footer"
      data-node-id="1796:105"
    >
      <div className="h-[148px] relative shrink-0 w-full" data-node-id="856:63">
        {/* Nav links row: left-[318px], top-[91px], p-[10px] */}
        <div
          className="absolute content-stretch flex items-end justify-center left-[318px] p-[10px] top-[91px]"
          data-node-id="837:65"
        >
          {/* 5 links: h-[40px], px-[16px], py-[10px], 14px Inter Medium, #666, rounded-[8px] */}
          <div className="bg-[rgba(42,200,100,0)] content-stretch flex h-[40px] items-center justify-center px-[16px] py-[10px] relative rounded-[8px] shrink-0">
            <div className="font-['Inter:Medium',sans-serif] font-medium text-[#666] text-[14px] text-center whitespace-nowrap">
              <p>Link</p>
            </div>
          </div>
          {/* ... 4 more identical links ... */}
        </div>

        {/* Left column: logo + social */}
        <div className="absolute left-0 top-0 w-[240px]" data-node-id="811:59">
          <div className="content-stretch flex flex-col gap-[5px] items-start w-[240px]">
            <Logo className="h-[101.865px] relative shrink-0 w-[183px]" />
            <div className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-black">
              <p>Follow us on social media</p>
            </div>
            <div className="content-stretch flex gap-[10px] items-center w-[155px]">
              <MediaIconSocial className="relative shrink-0 size-[20px]" />
              <MediaIconSocial className="relative shrink-0 size-[20px]" />
              <MediaIconSocial className="relative shrink-0 size-[20px]" />
              <MediaIconSocial className="relative shrink-0 size-[20px]" />
            </div>
          </div>
        </div>

        {/* Newsletter input: left-[417px], top-[41px] */}
        <Input className="absolute bg-white border border-[var(--secondary,#2699a6)] border-solid h-[41px] left-[417px] min-w-[270px] rounded-[25px] top-[41px] w-[270px]" />

        {/* Newsletter heading: left-[409px], top-[12px] */}
        <div className="absolute font-['Inter:Regular',sans-serif] font-normal text-[20px] text-black left-[409px] top-[12px] w-[351px]">
          <p>Sign Up for Hylee news &amp; updates!</p>
        </div>
      </div>
    </div>
  );
}
