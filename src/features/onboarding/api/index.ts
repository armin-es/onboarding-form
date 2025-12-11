import { apiClient } from "../../../lib/axios";
import { CorporationValidationResponseSchema } from "../types";
import type { CorporationValidationResponse, ProfileDetails } from "../types";

export const validateCorporationNumber = async (
  number: string
): Promise<CorporationValidationResponse> => {
  const { data } = await apiClient.get(`/corporation-number/${number}`);
  // Runtime validation of the response
  return CorporationValidationResponseSchema.parse(data);
};

export const submitProfile = async (details: ProfileDetails): Promise<void> => {
  await apiClient.post("/profile-details", details);
};
