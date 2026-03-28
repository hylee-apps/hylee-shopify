// ============================================================================
// Component
// ============================================================================

export function OurPromiseNotice() {
  return (
    <div
      className="flex flex-col gap-[8px] rounded-[12px] border border-[rgba(38,153,166,0.2)] bg-[rgba(38,153,166,0.05)] p-[21px]"
      data-testid="our-promise-notice"
    >
      {/* Header */}
      <h4 className="pl-[8px] text-[14px] font-semibold leading-[21px] text-return-accent">
        Our Promise
      </h4>

      {/* Body */}
      <p className="text-[14px] font-normal leading-[22.4px] text-[#4b5563]">
        We&apos;re committed to making this right for you. All return shipping
        is free, and we&apos;ll keep you updated every step of the way.
      </p>
    </div>
  );
}
