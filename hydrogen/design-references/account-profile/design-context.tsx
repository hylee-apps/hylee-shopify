// =============================================================================
// DO NOT MODIFY — Raw Figma MCP output
// Captured: 2026-03-24
// File: Q541sIDD20eXqQSSozFUw4 (Account Pages)
// Node: 2:995 (Profile Information / Settings page)
// =============================================================================

const imgVector =
  'https://www.figma.com/api/mcp/asset/a0845641-2cd5-4134-8569-eeb1e48a6ed3';
const imgVector1 =
  'https://www.figma.com/api/mcp/asset/a8e21c61-4d9c-4210-a727-8def1c22391d';
type ComponentProps = {
  className?: string;
  variant?: '1';
};

function Component({className, variant = '1'}: ComponentProps) {
  return (
    <div
      className={className || 'h-[14.063px] overflow-clip relative w-[15px]'}
      data-node-id="2:917"
    >
      <div
        className="absolute inset-[4.17%_10.94%]"
        data-name="Vector"
        data-node-id="2:915"
      >
        <img
          alt=""
          className="absolute block max-w-none size-full"
          src={imgVector}
        />
      </div>
      <div
        className="absolute inset-[0_3.13%]"
        data-name="Vector"
        data-node-id="2:916"
      >
        <img
          alt=""
          className="absolute block max-w-none size-full"
          src={imgVector1}
        />
      </div>
    </div>
  );
}

export default function DivAccountLayout() {
  return (
    <div
      className="content-stretch flex gap-[32px] items-start justify-center px-[24px] py-[32px] relative size-full"
      data-name="div.account-layout"
      data-node-id="2:995"
    >
      {/* SIDEBAR OMITTED — handled by account.tsx layout route */}
      <div
        className="content-stretch flex flex-col gap-[24px] items-start min-h-[600px] pb-[24px] relative shrink-0 w-[840px]"
        data-name="main.account-main"
        data-node-id="2:1038"
      >
        <div
          className="content-stretch flex flex-col items-start relative shrink-0 w-full"
          data-name="h1"
          data-node-id="2:1039"
        >
          <div
            className="flex flex-col font-['Roboto:Light',sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#1f2937] text-[28px] w-full"
            data-node-id="2:1040"
          >
            <p className="leading-[42px]">Profile Information</p>
          </div>
        </div>
        {/* Card 1: Personal Information */}
        <div
          className="bg-white border border-[#e5e7eb] border-solid content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full"
          data-name="div.card"
          data-node-id="2:1041"
        >
          <div
            className="border-[#e5e7eb] border-b border-solid relative shrink-0 w-full"
            data-name="div.card-header"
            data-node-id="2:1042"
          >
            <div className="content-stretch flex items-center pb-[21px] pt-[20px] px-[24px] relative w-full">
              <div
                className="font-bold text-[#111827] text-[18px] leading-[27px]"
                data-node-id="2:1044"
              >
                Personal Information
              </div>
            </div>
          </div>
          <div
            className="content-stretch flex flex-col gap-[32px] items-start p-[24px] relative w-full"
            data-name="div.card-body"
            data-node-id="2:1045"
          >
            {/* Avatar + Change Photo */}
            <div
              className="flex gap-[24px] items-center w-full"
              data-node-id="2:1046"
            >
              <div
                className="flex items-center justify-center rounded-[50px] size-[100px]"
                data-node-id="2:1047"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, rgb(38, 153, 166) 0%, rgb(43, 217, 168) 100%)',
                }}
              >
                <div
                  className="font-medium text-[40px] text-white leading-[60px]"
                  data-node-id="2:1048"
                >
                  JD
                </div>
              </div>
              <div className="flex flex-col gap-[7.75px]" data-node-id="2:1049">
                <div
                  className="bg-white border border-[#d1d5db] flex gap-[8px] items-center justify-center px-[25px] py-[13px] rounded-[8px]"
                  data-node-id="2:1050"
                >
                  {/* camera icon */}
                  <div
                    className="font-medium text-[#374151] text-[15px]"
                    data-node-id="I2:1050;2:913"
                  >
                    Change Photo
                  </div>
                </div>
                <div
                  className="text-[#6b7280] text-[13px] leading-[19.5px]"
                  data-node-id="2:1054"
                >
                  JPG, GIF or PNG. Max size 2MB
                </div>
              </div>
            </div>
            {/* Form */}
            <div
              className="flex flex-col w-full"
              data-name="form"
              data-node-id="2:1055"
            >
              {/* First Name + Last Name row */}
              <div
                className="flex gap-[16px] w-full pb-[20px]"
                data-name="div.form-row"
                data-node-id="2:1056"
              >
                <div
                  className="flex-1 flex flex-col gap-[8px]"
                  data-name="div.form-group"
                  data-node-id="2:1058"
                >
                  <label
                    className="font-medium text-[#374151] text-[14px] leading-[21px]"
                    data-node-id="2:1060"
                  >
                    First Name
                  </label>
                  <input
                    className="bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[13px] text-[15px]"
                    data-node-id="2:1061"
                  />
                </div>
                <div
                  className="flex-1 flex flex-col gap-[8px]"
                  data-name="div.form-group"
                  data-node-id="2:1065"
                >
                  <label
                    className="font-medium text-[#374151] text-[14px] leading-[21px]"
                    data-node-id="2:1067"
                  >
                    Last Name
                  </label>
                  <input
                    className="bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[13px] text-[15px]"
                    data-node-id="2:1068"
                  />
                </div>
              </div>
              {/* Email Address */}
              <div
                className="flex flex-col gap-[8px] w-full"
                data-name="div.form-group"
                data-node-id="2:1071"
              >
                <label
                  className="font-medium text-[#374151] text-[14px] leading-[21px]"
                  data-node-id="2:1073"
                >
                  Email Address
                </label>
                <input
                  className="bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[13px] text-[15px]"
                  data-node-id="2:1074"
                />
              </div>
              {/* Phone Number */}
              <div
                className="flex flex-col gap-[8px] w-full pt-[20px]"
                data-name="div.form-group"
                data-node-id="2:1077"
              >
                <label
                  className="font-medium text-[#374151] text-[14px] leading-[21px]"
                  data-node-id="2:1079"
                >
                  Phone Number
                </label>
                <input
                  className="bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[13px] text-[15px]"
                  data-node-id="2:1080"
                />
              </div>
              {/* Date of Birth */}
              <div
                className="flex flex-col gap-[8px] w-full py-[20px]"
                data-name="div.form-group"
                data-node-id="2:1083"
              >
                <label
                  className="font-medium text-[#374151] text-[14px] leading-[21px]"
                  data-node-id="2:1085"
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[13px] text-[15px]"
                  data-node-id="2:1086"
                />
              </div>
              {/* Save Changes */}
              <button
                className="bg-[#2699a6] text-white font-medium text-[15px] px-[24px] py-[12px] rounded-[8px] w-fit"
                data-node-id="2:1099"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
        {/* Card 2: Change Password */}
        <div
          className="bg-white border border-[#e5e7eb] border-solid flex flex-col gap-[24px] items-center overflow-clip pb-[25px] pt-px px-px rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-full"
          data-name="div.card"
          data-node-id="2:1101"
        >
          <div
            className="border-[#e5e7eb] border-b w-full"
            data-name="div.card-header"
            data-node-id="2:1102"
          >
            <div className="flex items-center pb-[21px] pt-[20px] px-[24px] w-full">
              <div
                className="font-bold text-[#111827] text-[18px] leading-[27px]"
                data-node-id="2:1104"
              >
                Change Password
              </div>
            </div>
          </div>
          <div
            className="w-[790px] flex flex-col"
            data-name="form"
            data-node-id="2:1105"
          >
            {/* Current Password */}
            <div
              className="flex flex-col gap-[8px] w-full"
              data-node-id="2:1106"
            >
              <label
                className="font-medium text-[#374151] text-[14px] leading-[21px]"
                data-node-id="2:1108"
              >
                Current Password
              </label>
              <input
                placeholder="Enter current password"
                className="bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[13px] text-[15px]"
                data-node-id="2:1109"
              />
            </div>
            {/* New Password + Confirm row */}
            <div
              className="flex gap-[16px] w-full pt-[20px] pb-[20px]"
              data-name="div.form-row"
              data-node-id="2:1112"
            >
              <div
                className="flex-1 flex flex-col gap-[8px]"
                data-node-id="2:1114"
              >
                <label
                  className="font-medium text-[#374151] text-[14px] leading-[21px]"
                  data-node-id="2:1116"
                >
                  New Password
                </label>
                <input
                  placeholder="Enter new password"
                  className="bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[13px] text-[15px]"
                  data-node-id="2:1117"
                />
              </div>
              <div
                className="flex-1 flex flex-col gap-[8px]"
                data-node-id="2:1121"
              >
                <label
                  className="font-medium text-[#374151] text-[14px] leading-[21px]"
                  data-node-id="2:1123"
                >
                  Confirm New Password
                </label>
                <input
                  placeholder="Confirm new password"
                  className="bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[13px] text-[15px]"
                  data-node-id="2:1124"
                />
              </div>
            </div>
            {/* Update Password */}
            <button
              className="bg-[#2699a6] text-white font-medium text-[15px] px-[24px] py-[12px] rounded-[8px] w-fit"
              data-node-id="2:1127"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
