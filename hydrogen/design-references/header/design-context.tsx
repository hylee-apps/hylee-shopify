/**
 * FIGMA DESIGN REFERENCE — DO NOT MODIFY
 *
 * Raw output from Figma MCP `get_design_context` for Header (node 2766:311).
 * This file is an immutable reference for comparing against the implementation.
 *
 * Source: https://www.figma.com/design/d52sF4D2B0bIzt3A4z3UjE/Hy-lee-design?node-id=2766-311
 * Captured: 2026-02-15
 * Variant: Property 1=Alternate
 */

// Asset URLs (expire after 7 days — re-fetch from Figma MCP if needed)
const imgEllipse3 =
  'https://www.figma.com/api/mcp/asset/c8496abc-bf41-4833-980b-9967c0445919';
const imgLine1 =
  'https://www.figma.com/api/mcp/asset/3c8f0021-3171-48db-ae72-eca70b574561';
const imgLogoCondensed =
  'https://www.figma.com/api/mcp/asset/3429f509-9d55-48da-ad69-d6e397731422';
const imgFrame21 =
  'https://www.figma.com/api/mcp/asset/03ff7ea4-9e0c-47ec-9a31-248f8daf1b20';
const imgVector =
  'https://www.figma.com/api/mcp/asset/9dd9c3a7-a1d4-4586-a67a-846f82c6c048';
const imgIcon =
  'https://www.figma.com/api/mcp/asset/be3c220e-93e0-4b39-82d0-c3829e2ce9b1';
const imgEllipse7 =
  'https://www.figma.com/api/mcp/asset/9a38ced8-ec6e-4d0a-ade6-c055a503770f';

function IconMagnifier({className}: {className?: string}) {
  return (
    <div
      className={className || 'h-[28.826px] relative w-[27.853px]'}
      data-name="Icon, Magnifier"
      data-node-id="2766:106"
    >
      <div
        className="absolute inset-[0_10.24%_13.27%_0]"
        data-node-id="2766:107"
      >
        <img
          alt=""
          className="absolute block inset-0 max-w-none"
          src={imgEllipse3}
        />
      </div>
      <div className="absolute flex inset-[72.38%_0_0_73.98%] items-center justify-center">
        <div className="-scale-y-100 flex-none h-[0.589px] rotate-[48.01deg] w-[10.18px]">
          <div className="relative size-full" data-node-id="2766:108">
            <div className="absolute inset-[-84.82%_-0.28%]">
              <img
                alt=""
                className="block max-w-none size-full"
                src={imgLine1}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({className}: {className?: string}) {
  return (
    <div className={className || ''} data-name="Input" data-node-id="2766:176">
      <div
        className="bg-white content-stretch flex h-[50px] items-center justify-between px-[13px] py-[10px] relative rounded-[25px] w-[683px]"
        data-name="Property 1=Search"
        data-node-id="2766:180"
      >
        <div
          className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(0,0,0,0.5)] text-center whitespace-nowrap"
          data-node-id="2766:181"
        >
          <p className="leading-[normal]">Placeholder text</p>
        </div>
        <IconMagnifier className="h-[28.826px] relative shrink-0 w-[27.853px]" />
      </div>
    </div>
  );
}

function LogoCondensed({className}: {className?: string}) {
  return (
    <div
      className={className || 'h-[50px] relative w-[65px]'}
      data-name="Logo, Condensed"
      data-node-id="2766:135"
    >
      <img
        alt=""
        className="absolute inset-0 max-w-none object-contain pointer-events-none size-full"
        src={imgLogoCondensed}
      />
    </div>
  );
}

function Header({className}: {className?: string}) {
  return (
    <div className={className || ''} data-name="Header" data-node-id="2766:139">
      <div
        className="bg-[var(--alternate,white)] border-2 border-[var(--primary,#2ac864)] border-solid content-stretch flex flex-col h-[79px] items-center justify-center px-[122px] py-[10px] relative w-[1440px]"
        data-name="Property 1=Alternate"
        data-node-id="2766:140"
      >
        <div
          className="content-stretch flex gap-[38px] items-center justify-center px-[122px] relative shrink-0 w-[1440px]"
          data-node-id="2766:141"
        >
          <LogoCondensed className="h-[50px] relative shrink-0 w-[65px]" />
          <div
            className="relative shrink-0 size-[40px]"
            data-node-id="2766:143"
          >
            <div
              className="absolute bg-[rgba(0,0,0,0)] border-2 border-[var(--primary,#2ac864)] border-solid content-stretch flex flex-col items-center justify-center left-[-1px] px-[8px] py-[11px] rounded-[6px] size-[40px] top-[-0.5px]"
              data-name="Button"
              data-node-id="2766:144"
            >
              <div
                className="h-[16px] relative shrink-0 w-[24px]"
                data-node-id="2766:145"
              >
                <div className="absolute inset-[-6.25%_0_0_0]">
                  <img
                    alt=""
                    className="block max-w-none size-full"
                    src={imgFrame21}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className="bg-white border-2 border-[var(--secondary,#2699a6)] border-solid content-stretch flex items-center overflow-clip relative rounded-[27px] shrink-0"
            data-node-id="2766:149"
          >
            <Input className="bg-white content-stretch flex h-[50px] items-center justify-between px-[13px] py-[10px] relative rounded-[25px] shrink-0 w-[683px]" />
          </div>
          <div
            className="h-[40px] relative shrink-0 w-[300px]"
            data-node-id="2766:151"
          >
            <div
              className="absolute bg-[rgba(42,200,100,0)] content-stretch flex items-center justify-center left-0 px-[16px] py-[10px] rounded-[8px] top-[1.5px] w-[80px]"
              data-name="Link"
              data-node-id="2766:152"
            >
              <div
                className="content-stretch flex gap-[2px] items-center justify-center relative shrink-0"
                data-node-id="I2766:152;2766:93"
              >
                <div
                  className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#666] text-[14px] text-center whitespace-nowrap"
                  data-node-id="I2766:152;2766:94"
                >
                  <p className="leading-[normal]">Link</p>
                </div>
                <div className="flex items-center justify-center relative shrink-0">
                  <div className="flex-none rotate-180">
                    <div
                      className="relative size-[10px]"
                      data-name="Chevron, Down"
                      data-node-id="I2766:152;2766:95"
                    >
                      <div className="absolute flex inset-[37.5%_29.17%] items-center justify-center">
                        <div className="flex-none h-[4.167px] rotate-90 w-[2.5px]">
                          <div
                            className="relative size-full"
                            data-name="Vector"
                            data-node-id="I2766:152;2766:95;2766:104"
                          >
                            <img
                              alt=""
                              className="absolute block inset-0 max-w-none"
                              src={imgVector}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="absolute bg-[rgba(42,200,100,0)] content-stretch flex items-center justify-center left-[80px] px-[16px] py-[10px] rounded-[8px] top-[1.5px]"
              data-name="Link"
              data-node-id="2766:153"
            >
              <div
                className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#666] text-[14px] text-center whitespace-nowrap"
                data-node-id="I2766:153;2766:89"
              >
                <p className="leading-[normal]">Link</p>
              </div>
            </div>
            <div
              className="absolute left-[177.5px] overflow-clip size-[48px] top-[5.5px]"
              data-name="Shopping cart"
              data-node-id="2766:154"
            >
              <div
                className="absolute inset-[4.17%_4.17%_8.33%_4.17%]"
                data-name="Icon"
                data-node-id="I2766:154;7758:12248"
              >
                <div className="absolute inset-[-7.62%_-7.27%]">
                  <img
                    alt=""
                    className="block max-w-none size-full"
                    src={imgIcon}
                  />
                </div>
              </div>
            </div>
            <div
              className="absolute contents left-[206.5px] top-[1.5px]"
              data-node-id="2766:155"
            >
              <div
                className="absolute h-[13.636px] left-[206.5px] top-[2.86px] w-[15px]"
                data-node-id="2766:156"
              >
                <img
                  alt=""
                  className="absolute block inset-0 max-w-none"
                  src={imgEllipse7}
                />
              </div>
              <div
                className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] left-[214px] not-italic text-[9px] text-black text-center top-[9px] w-[9px]"
                data-node-id="2766:157"
              >
                <p className="leading-[normal] whitespace-pre-wrap">2</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Header1() {
  return (
    <Header className="bg-[var(--alternate,white)] border-2 border-[var(--primary,#2ac864)] border-solid content-stretch flex flex-col items-center justify-center px-[122px] py-[10px] relative size-full" />
  );
}
