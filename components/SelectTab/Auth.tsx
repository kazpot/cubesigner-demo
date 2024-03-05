import { useEffect, useState } from "react";
import { AmmType, TokenType } from "../../hooks/useContract";
import InputNumberBox from "../InputBox/InputNumberBox";
import styles from "./SelectTab.module.css";

type Props = {
  token0: TokenType | undefined;
  token1: TokenType | undefined;
  amm: AmmType | undefined;
  currentAccount: string | undefined;
};

export default function Auth({ token0, token1, amm, currentAccount }: Props) {
  const [tokenIn, setTokenIn] = useState<TokenType>();
  const [tokenOut, setTokenOut] = useState<TokenType>();

  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");

  useEffect(() => {
    setTokenIn(token0);
    setTokenOut(token1);
  }, [token0, token1]);

  return (
    <div className={styles.tabBody}>
      <InputNumberBox
        leftHeader={"Email"}
        right={tokenIn ? tokenIn.symbol : ""}
        value={amountIn}
        onChange={(e) => e}
      />
      <div style={{ color: "white", textAlign: "center" }}>or</div>
      <InputNumberBox
        leftHeader={"Password"}
        right={tokenOut ? tokenOut.symbol : ""}
        value={amountOut}
        onChange={(e) => e}
      />
      <div className={styles.bottomDiv}></div>
    </div>
  );
}
