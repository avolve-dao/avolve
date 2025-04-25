// lib/utils/nftMarketplaceIntegration.ts

/**
 * Interface for an NFT item to be listed on an external marketplace
 */
interface NFTItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tokenId: string;
  ownerId: string;
  rewardCategory?: string;
  rewardAmount?: number;
}

/**
 * Hypothetical API endpoint for an external NFT marketplace
 */
const MARKETPLACE_API_URL = 'https://api.example-nft-marketplace.com/v1';
const MARKETPLACE_API_KEY = process.env.NEXT_PUBLIC_NFT_MARKETPLACE_API_KEY || '';

/**
 * List an Avolve reward or token as an NFT on an external marketplace
 * @param nftItem The NFT item details derived from Avolve rewards or tokens
 * @returns Promise with the result of the listing operation
 */
export async function listNFTOnMarketplace(
  nftItem: NFTItem
): Promise<{ success: boolean; listingId?: string; error?: string }> {
  if (!MARKETPLACE_API_KEY) {
    console.error('NFT Marketplace API key is not configured.');
    return { success: false, error: 'API key not configured' };
  }

  try {
    const response = await fetch(`${MARKETPLACE_API_URL}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MARKETPLACE_API_KEY}`,
      },
      body: JSON.stringify({
        nftId: nftItem.id,
        name: nftItem.name,
        description: nftItem.description,
        image: nftItem.imageUrl,
        tokenId: nftItem.tokenId,
        owner: nftItem.ownerId,
        metadata: {
          source: 'Avolve',
          rewardCategory: nftItem.rewardCategory || 'N/A',
          rewardAmount: nftItem.rewardAmount || 0,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to list NFT: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, listingId: data.listingId };
  } catch (error) {
    console.error('Error listing NFT on marketplace:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Format an Avolve reward into an NFT item for marketplace listing
 * @param reward The reward data from Avolve
 * @param userId The ID of the user owning the reward
 * @returns NFTItem formatted for marketplace integration
 */
export function formatRewardAsNFT(
  reward: { reward_category: string; reward_amount: number; eligibility_reason: string },
  userId: string
): NFTItem {
  const id = `${userId}-${reward.reward_category}-${Date.now()}`;
  return {
    id,
    name: `${reward.reward_category} Reward NFT`,
    description: `Avolve ${reward.reward_category} reward of ${reward.reward_amount} earned for: ${reward.eligibility_reason}`,
    imageUrl: `https://avolve.example.com/reward-images/${reward.reward_category.toLowerCase().replace(/\s+/g, '-')}.png`,
    tokenId: id,
    ownerId: userId,
    rewardCategory: reward.reward_category,
    rewardAmount: reward.reward_amount,
  };
}

/**
 * Check if the marketplace integration is properly configured
 * @returns True if the API key is set and integration is possible
 */
export function isMarketplaceIntegrationEnabled(): boolean {
  return !!MARKETPLACE_API_KEY;
}

// TODO: Uncomment and ensure this import is valid, or implement shareContent locally if needed
// import { shareContent } from '@/lib/utils/socialSharing';

/**
 * Utility to share a listed NFT on social media after successful listing
 * @returns True if sharing is initiated
 */
export function shareNFTListing(): boolean {
  // const marketplaceUrl = `https://example-nft-marketplace.com/listing/${listingId}`;
  // const message = `Check out my Avolve Reward NFT now listed on the marketplace! #Avolve #NFT`;

  // TODO: Implement or import shareContent for sharing functionality
  return false;
}
