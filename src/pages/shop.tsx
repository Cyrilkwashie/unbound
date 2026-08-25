import { InnerPage } from "@/components/InnerPage";
import { ShopIndex } from "@/components/ShopIndex";

export default function ShopPage() {
  return (
    <InnerPage
      title="SHOP"
      kicker="COLLECTION 001"
      description="Shop UNBOUND. Oversized tops, cargos, and the garments that follow."
    >
      <ShopIndex />
    </InnerPage>
  );
}
