// Compatibility declarations for @phosphor-icons/react 2.1.10.
// Some npm and TypeScript combinations do not resolve the package declarations
// through its export map even though the JavaScript modules load correctly.
declare module "@phosphor-icons/react" {
  import type {
    ForwardRefExoticComponent,
    RefAttributes,
    SVGProps,
  } from "react";

  export type IconWeight =
    "thin" | "light" | "regular" | "bold" | "fill" | "duotone";

  export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
    alt?: string;
    color?: string;
    mirrored?: boolean;
    size?: string | number;
    weight?: IconWeight;
  }

  export type Icon = ForwardRefExoticComponent<
    IconProps & RefAttributes<SVGSVGElement>
  >;

  export const ArrowClockwise: Icon;
  export const ArrowRight: Icon;
  export const ArrowsClockwise: Icon;
  export const Bed: Icon;
  export const CalendarBlank: Icon;
  export const CalendarPlus: Icon;
  export const Car: Icon;
  export const CaretLeft: Icon;
  export const CaretRight: Icon;
  export const Check: Icon;
  export const CheckCircle: Icon;
  export const CircleNotch: Icon;
  export const Clock: Icon;
  export const ClockCounterClockwise: Icon;
  export const Copy: Icon;
  export const DotsSixVertical: Icon;
  export const DotsThreeCircle: Icon;
  export const DownloadSimple: Icon;
  export const FilmSlate: Icon;
  export const ForkKnife: Icon;
  export const GoogleLogo: Icon;
  export const Hourglass: Icon;
  export const ImageSquare: Icon;
  export const Info: Icon;
  export const Lightbulb: Icon;
  export const LinkSimple: Icon;
  export const MapPin: Icon;
  export const MapTrifold: Icon;
  export const Mountains: Icon;
  export const PaperPlaneTilt: Icon;
  export const Path: Icon;
  export const Plus: Icon;
  export const Receipt: Icon;
  export const ShareNetwork: Icon;
  export const Sparkle: Icon;
  export const Ticket: Icon;
  export const Trash: Icon;
  export const UserMinus: Icon;
  export const Warning: Icon;
  export const WarningCircle: Icon;
  export const X: Icon;
}

declare module "@phosphor-icons/react/dist/ssr" {
  import type { Icon } from "@phosphor-icons/react";

  export const AirplaneTilt: Icon;
  export const ArrowLeft: Icon;
  export const ArrowRight: Icon;
  export const ArrowUpRight: Icon;
  export const CalendarBlank: Icon;
  export const CalendarCheck: Icon;
  export const CheckCircle: Icon;
  export const CircleNotch: Icon;
  export const Clock: Icon;
  export const Compass: Icon;
  export const MapPin: Icon;
  export const MapTrifold: Icon;
  export const Plus: Icon;
  export const Receipt: Icon;
  export const SignOut: Icon;
  export const UserCircle: Icon;
  export const Users: Icon;
  export const UsersThree: Icon;
  export const Wallet: Icon;
  export const Warning: Icon;
  export const WarningCircle: Icon;
}
