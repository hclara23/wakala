import type { StaticImageData } from 'next/image';
import applianceHaulImage from '@/assets/huge-dump-of-household-electrical-goods-for-recycl-2026-01-05-05-49-19-utc.jpg';
import appliancePickupImage from '@/assets/pick of unwanted aappliances for proper disposal.jpg';
import drywallRemodelImage from '@/assets/drywall-walls-building-by-a-contractor-worker-2026-01-08-00-24-00-utc.jpg';
import drivewayWashingImage from '@/assets/man-washing-the-driveway-2026-01-09-00-22-13-utc.jpg';
import handymanToolsImage from '@/assets/a-carpenter-prepares-tools-while-working-on-a-cons-2026-01-08-23-56-51-utc.jpg';
import pressureWashingStepsImage from '@/assets/cleaning-outdoor-steps-with-a-pressure-washer-in-b-2026-01-09-11-38-15-utc.jpg';
import trashAfterImage from '@/assets/after trash can.jpg';
import trashBeforeImage from '@/assets/Before trash can.jpg';
import unwantedAppliancesImage from '@/assets/unwanted appliances.jpg';
import walkwayWashingImage from '@/assets/garden-brick-path-washing-2026-01-09-01-08-58-utc.jpg';
import yardCleanupMaintenanceImage from '@/assets/garden-washing-maintenance-2026-01-08-23-59-30-utc.jpg';
import yardCleanupWorkerImage from '@/assets/man-cleaning-the-yard-2026-01-07-01-55-21-utc.jpg';

export type SiteImage = string | StaticImageData;

export const blogImageAssets = {
  dumpsterGuide: applianceHaulImage,
  pressureWashingGuide: drivewayWashingImage,
  yardCleanupGuide: yardCleanupWorkerImage,
  handymanGuide: drywallRemodelImage,
} as const;

export const galleryImageAssets = {
  applianceHaul: applianceHaulImage,
  appliancePickup: appliancePickupImage,
  drywallRemodel: drywallRemodelImage,
  drivewayWashing: drivewayWashingImage,
  handymanTools: handymanToolsImage,
  pressureWashingSteps: pressureWashingStepsImage,
  trashAfter: trashAfterImage,
  trashBefore: trashBeforeImage,
  unwantedAppliances: unwantedAppliancesImage,
  walkwayWashing: walkwayWashingImage,
  yardCleanupMaintenance: yardCleanupMaintenanceImage,
  yardCleanupWorker: yardCleanupWorkerImage,
} as const;

export function getSiteImageSrc(image: SiteImage) {
  return typeof image === 'string' ? image : image.src;
}
