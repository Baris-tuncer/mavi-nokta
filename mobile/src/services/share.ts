import { Share } from "react-native";
import * as Linking from "expo-linking";

export async function shareCampaign(campaign: {
  id: string;
  title: string;
  slogan: string;
  newPrice: number;
  businessName: string;
}) {
  const url = Linking.createURL(`/campaign/${campaign.id}`);
  const message = [
    `${campaign.businessName} - ${campaign.title}`,
    campaign.slogan,
    `Sadece ${campaign.newPrice}TL!`,
    "",
    url,
  ].join("\n");

  await Share.share({ message, title: campaign.title });
}
