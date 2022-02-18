import { Connection, PublicKey, Transaction } from "@solana/web3.js"
import { serialize } from "borsh"
import { DeleteAuctionArgs, SCHEMA } from "../schema"
import { padTo32Bytes } from "../utils/padTo32Bytes"
import { parseInstruction } from "../utils/parseInstruction"
import { NUM_OF_CYCLES_TO_DELETE } from "../consts"

export async function deleteAuction(
  auctionId: string,
  auctionOwnerPubkey: PublicKey,
  topBidderPubkey: PublicKey,
  currentAuctionCycle: number,
) {
  const { deleteAuctionWasm } = await import("../wasm-factory")

  const auctionIdArray = padTo32Bytes(auctionId)
  const deleteAuctionArgs = new DeleteAuctionArgs({
    auctionOwnerPubkey,
    topBidderPubkey: topBidder,
    auctionId: auctionIdArray,
    currentAuctionCycle,
    numOfCyclesToDelete: NUM_OF_CYCLES_TO_DELETE,
  })

  try {
    const instruction = parseInstruction(deleteAuctionWasm(serialize(SCHEMA, deleteAuctionArgs)))
    return new Transaction().add(instruction)
  } catch (e) {
    console.log("wasm error:", e)
  }
}
