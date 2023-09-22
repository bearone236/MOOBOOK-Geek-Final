import "../styles/header.css";
import Camera from "./Camera";
import { Operate } from "./operate";

export const Header = () => {
  return (
    <div>
      <header className="header">
        <section>
          <img src="./MOOBOOK.png" alt="icon" className="headerImage" />
          <div className="operate">
            <Operate />
          </div>
        </section>
        <div className="camera">
          <Camera />
        </div>
      </header>
    </div>
  );
};
