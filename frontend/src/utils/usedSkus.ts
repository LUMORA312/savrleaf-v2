import { Deal, Dispensary } from "@/types";

/**
 * Count the number of active deals belonging to a specific user.
 * 
 * @param userId - ID of the user
 * @param deals - all deals loaded
 * @param dispensaries - all dispensaries loaded
 * @returns number of active deals for the user
 */
export function countUserActiveDeals(
  userId: string,
  deals: Deal[],
  dispensaries: Dispensary[]
): number {
  // Get all dispensary IDs for this user
  const userDispensaryIds = dispensaries
    .filter(d => String(d.user) === String(userId))
    .map(d => d._id);

  console.log("dispensaries", dispensaries);
  console.log("filtered dispensaries: ",userDispensaryIds)
  console.log("user id:", userId);
  console.log("deals", deals);
  // Count deals that belong to the user's dispensaries
  // TO DO: MANUALLY ACTIVE??
  const count = deals.filter(
    deal => userDispensaryIds.includes(String(deal.dispensary))
  ).length;

  return count;
}
