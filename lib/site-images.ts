import type { StaticImageData } from 'next/image';
import applianceHaulImage from '@/public/images/huge-dump-of-household-electrical-goods-for-recycl-2026-01-05-05-49-19-utc.jpg';
import appliancePickupImage from '@/public/images/pick of unwanted aappliances for proper disposal.jpg';
import drywallRemodelImage from '@/public/images/drywall-walls-building-by-a-contractor-worker-2026-01-08-00-24-00-utc.jpg';
import drivewayWashingImage from '@/public/images/man-washing-the-driveway-2026-01-09-00-22-13-utc.jpg';
import handymanToolsImage from '@/public/images/a-carpenter-prepares-tools-while-working-on-a-cons-2026-01-08-23-56-51-utc.jpg';
import pressureWashingStepsImage from '@/public/images/cleaning-outdoor-steps-with-a-pressure-washer-in-b-2026-01-09-11-38-15-utc.jpg';
import trashAfterImage from '@/public/images/after trash can.jpg';
import trashBeforeImage from '@/public/images/Before trash can.jpg';
import unwantedAppliancesImage from '@/public/images/unwanted appliances.jpg';
import walkwayWashingImage from '@/public/images/garden-brick-path-washing-2026-01-09-01-08-58-utc.jpg';
import yardCleanupMaintenanceImage from '@/public/images/garden-washing-maintenance-2026-01-08-23-59-30-utc.jpg';
import yardCleanupWorkerImage from '@/public/images/man-cleaning-the-yard-2026-01-07-01-55-21-utc.jpg';
import evictionHorror1 from '@/public/images/eviction-horror-1.jpg';
import evictionHorror2 from '@/public/images/eviction-horror-2.jpg';
import evictionHorrorCrew from '@/public/images/eviction-horror-crew.jpg';
import propertyResetCover from '@/public/images/property-reset-cover.jpg';
import debrisRemoval from '@/public/images/debris-removal.jpg';
import yardCleanup from '@/public/images/yard-cleanup.jpg';
import propertyPressureWashing from '@/public/images/property-pressure-washing.jpg';
import smallRepairsInterior from '@/public/images/small-repairs-interior.jpg';

export type SiteImage = string | StaticImageData;

export const blogImageAssets = {
  dumpsterGuide: applianceHaulImage,
  pressureWashingGuide: drivewayWashingImage,
  yardCleanupGuide: yardCleanupWorkerImage,
  handymanGuide: drywallRemodelImage,
  evictionHorror: evictionHorror1,
  propertyReset: propertyResetCover,
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
  evictionHorror1: evictionHorror1,
  evictionHorror2: evictionHorror2,
  evictionHorrorCrew: evictionHorrorCrew,
  propertyResetCover: propertyResetCover,
  debrisRemoval: debrisRemoval,
  yardCleanup: yardCleanup,
  propertyPressureWashing: propertyPressureWashing,
  smallRepairsInterior: smallRepairsInterior,
} as const;

export function getSiteImageSrc(image: SiteImage) {
  return typeof image === 'string' ? image : image.src;
}
