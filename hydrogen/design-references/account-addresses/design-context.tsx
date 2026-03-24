/**
 * DO NOT MODIFY — Raw Figma MCP output
 * Captured: 2026-03-24
 * File key: Q541sIDD20eXqQSSozFUw4
 * Node ID: 19:968
 * Tool: get_design_context
 *
 * This file is the raw Figma-generated code for reference only.
 * Actual implementation should be adapted to the project's stack.
 */

export default function DivAccountLayout() {
  return (
    <div
      className="relative size-full"
      data-name="div.account-layout"
      data-node-id="19:968"
    >
      <div
        className="absolute content-stretch flex flex-col gap-[8px] items-start left-[24px] right-[24px] top-[32px]"
        data-name="div.page-header"
        data-node-id="19:969"
      >
        <div
          className="content-stretch flex flex-col items-start relative shrink-0 w-full"
          data-name="h1.page-title"
          data-node-id="19:970"
        >
          <div
            className="flex flex-col font-['Roboto:Light',sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#111827] text-[28px] w-full"
            data-node-id="19:971"
          >
            <p className="leading-[42px]">Address Book</p>
          </div>
        </div>
        <div
          className="content-stretch flex flex-col items-start relative shrink-0 w-full"
          data-name="p.page-subtitle"
          data-node-id="19:972"
        >
          <div
            className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#4b5563] text-[15px] w-full"
            data-node-id="19:973"
          >
            <p className="leading-[22.5px]">
              Manage your contacts and addresses
            </p>
          </div>
        </div>
      </div>
      {/* Category Bar */}
      <div
        className="absolute bg-white border-2 border-[#a8d5a0] border-solid content-stretch flex items-center left-[24px] overflow-auto px-[18px] py-[10px] right-[24px] rounded-[8px] top-[136.5px]"
        data-name="Category Bar"
        data-node-id="19:974"
      >
        {/* Home (inactive) */}
        <div
          className="relative rounded-[4px] shrink-0"
          data-name="Component 2"
          data-node-id="19:975"
        >
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[16px] py-[12px] relative">
            <div className="text-[#4b5563] text-[18px]">house-icon</div>
            <div className="font-medium text-[#4b5563] text-[16px] leading-[24px]">
              Home
            </div>
          </div>
        </div>
        {/* Family (active) */}
        <div
          className="bg-[#2ac864] relative rounded-[4px] shrink-0"
          data-name="Component 2"
          data-node-id="19:980"
        >
          <div className="flex gap-[8px] items-center px-[16px] py-[12px]">
            <div className="text-[18px] text-white">users-icon</div>
            <div className="font-medium text-[16px] text-white leading-[24px]">
              Family
            </div>
          </div>
        </div>
        {/* Friends (inactive) */}
        <div className="relative rounded-[4px] shrink-0">
          <div className="flex gap-[8px] items-center px-[16px] py-[12px]">
            <div className="text-[#4b5563] text-[18px]">friends-icon</div>
            <div className="font-medium text-[#4b5563] text-[16px] leading-[24px]">
              Friends
            </div>
          </div>
        </div>
        {/* Work (inactive) */}
        <div className="relative rounded-[4px] shrink-0">
          <div className="flex gap-[8px] items-center px-[16px] py-[12px]">
            <div className="text-[#4b5563] text-[18px]">work-icon</div>
            <div className="font-medium text-[#4b5563] text-[16px] leading-[24px]">
              Work
            </div>
          </div>
        </div>
        {/* Other (inactive) */}
        <div className="relative rounded-[4px] shrink-0">
          <div className="flex gap-[8px] items-center px-[16px] py-[12px]">
            <div className="text-[#4b5563] text-[18px]">other-icon</div>
            <div className="font-medium text-[#4b5563] text-[16px] leading-[24px]">
              Other
            </div>
          </div>
        </div>
      </div>
      {/* Subcategory Bar */}
      <div className="absolute border-[#e5e7eb] border-b border-solid flex gap-[24px] items-center left-[24px] overflow-auto pb-[17px] pt-[16px] right-[24px] top-[228.5px]">
        <div className="rounded-[4px] px-[12px] py-[8px] text-[#4b5563] text-[15px] leading-[22.5px]">
          Parents
        </div>
        <div className="rounded-[4px] px-[12px] py-[8px] text-[#4b5563] text-[15px] leading-[22.5px]">
          Sibling
        </div>
        <div className="bg-[rgba(42,200,100,0.1)] rounded-[4px] px-[12px] py-[8px] font-medium text-[#2ac864] text-[15px] leading-[22.5px]">
          Children
        </div>
        <div className="rounded-[4px] px-[12px] py-[8px] text-[#4b5563] text-[15px] leading-[22.5px]">
          Aunt &amp; Uncles
        </div>
        <div className="rounded-[4px] px-[12px] py-[8px] text-[#4b5563] text-[15px] leading-[22.5px]">
          Cousins
        </div>
        <div className="rounded-[4px] px-[12px] py-[8px] text-[#4b5563] text-[15px] leading-[22.5px]">
          Grandparents
        </div>
      </div>
      {/* Relationship Bar */}
      <div className="absolute flex gap-[16px] h-[59px] items-start justify-center left-[24px] right-[24px] top-[324px]">
        <div className="border-2 border-transparent flex-1 flex flex-col items-center p-[18px] rounded-[8px] font-medium text-[#1f2937] text-[15px] text-center leading-[22.5px]">
          Son
        </div>
        <div className="border-2 border-transparent flex-1 flex flex-col items-center p-[18px] rounded-[8px] font-medium text-[#1f2937] text-[15px] text-center leading-[22.5px]">
          Daughter
        </div>
      </div>
      {/* Subsection Header */}
      <div className="absolute flex items-center justify-between border-b-2 border-[#2ac864] pb-[18px] left-[24px] right-[24px] top-[406.5px]">
        <div className="flex gap-[12px] items-center">
          <div className="bg-[#2ac864] flex items-center justify-center rounded-[20px] size-[40px]">
            <span className="text-[18px] text-white">child-icon</span>
          </div>
          <div>
            <h2 className="font-semibold text-[#111827] text-[20px] leading-[30px]">
              Children
            </h2>
            <p className="text-[#6b7280] text-[13px] leading-[19.5px]">
              Manage your children's information and addresses
            </p>
          </div>
        </div>
        <button className="bg-[#4fd1a8] rounded-[8px] flex gap-[16px] items-center justify-center px-[16px] py-[8px]">
          <span className="text-[14px] text-white leading-[14px]">+</span>
          <span className="font-medium text-[14px] text-white">Add Child</span>
        </button>
      </div>
      {/* Stats Bar */}
      <div className="absolute flex gap-[16px] h-[79px] left-[24px] right-[24px] top-[480px]">
        <div className="bg-white border border-[#e5e7eb] flex-1 flex gap-[12px] items-center p-[17px] rounded-[8px]">
          <div className="bg-[rgba(42,200,100,0.1)] rounded-[8px] size-[36px] flex items-center justify-center">
            <span className="text-[#2ac864] text-[16px]">male-icon</span>
          </div>
          <div>
            <div className="text-[#6b7280] text-[12px] uppercase tracking-[0.5px] leading-[18px]">
              Sons
            </div>
            <div className="font-semibold text-[#111827] text-[18px] leading-[27px]">
              1
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#e5e7eb] flex-1 flex gap-[12px] items-center p-[17px] rounded-[8px]">
          <div className="bg-[rgba(242,176,94,0.1)] rounded-[8px] size-[36px] flex items-center justify-center">
            <span className="text-[#f2b05e] text-[16px]">female-icon</span>
          </div>
          <div>
            <div className="text-[#6b7280] text-[12px] uppercase tracking-[0.5px] leading-[18px]">
              Daughters
            </div>
            <div className="font-semibold text-[#111827] text-[18px] leading-[27px]">
              1
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#e5e7eb] flex-1 flex gap-[12px] items-center p-[17px] rounded-[8px]">
          <div className="bg-[rgba(79,209,168,0.1)] rounded-[8px] size-[36px] flex items-center justify-center">
            <span className="text-[#4fd1a8] text-[16px]">group-icon</span>
          </div>
          <div>
            <div className="text-[#6b7280] text-[12px] uppercase tracking-[0.5px] leading-[18px]">
              Total Children
            </div>
            <div className="font-semibold text-[#111827] text-[18px] leading-[27px]">
              2
            </div>
          </div>
        </div>
      </div>
      {/* Contact Cards */}
      {/* ... (see full design-context output for contact card and add-contact card details) */}
    </div>
  );
}
