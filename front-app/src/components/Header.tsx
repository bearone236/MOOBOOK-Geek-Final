import "../styles/header.css";
import Camera from "./Camera";
import { Operate } from "./operate";

export const Header = () => {
  return (
    <div>
      <header className="header">
        <img src="./MOOBOOK.png" alt="icon" className="headerImage" />
        <Operate />
        <div className="camera">
          <Camera />
        </div>
      </header>
    </div>
  );
};
