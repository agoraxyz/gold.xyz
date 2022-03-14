import { Transaction } from "@solana/web3.js"
import importGlue from "contract-logic/importGlue"
import parseInstruction from "./parseInstruction"

export default async function claimRewards(
  payerPubkey: string,
  topBidderPubkey: string,
  auctionId: string,
  cycleNumber: number,
  tokenType: string,
  existingTokenMint?: string
): Promise<Transaction> {
  const { claimRewardsWasm } = await importGlue()

  try {
    const instruction = parseInstruction(
      await claimRewardsWasm({
        payerPubkey,
        topBidderPubkey,
        auctionId,
        cycleNumber,
        tokenType,
        existingTokenMint,
      })
    )
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
