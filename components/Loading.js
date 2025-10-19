import icon from "../public/apple-touch-icon.png";
import Image from "next/image";

const Loading = () => (
  <div className="absolute right-2 top-2">
    <Image
      className="animate-spin"
      width={32}
      height={32}
      src={icon}
      alt="Loading spinner"
    />
  </div>
);

export default Loading;
