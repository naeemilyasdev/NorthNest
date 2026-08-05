import Setting from '../models/Setting.js';
import Order from '../models/Order.js';

const DEFAULT_STORE_SETTINGS = {
  storeName: 'North Nest',
  tagline: 'Mountain essentials from the Himalayas',
  logo: '',
  team: [
    {
      name: 'Ayesha',
      position: 'Founder',
      intro: 'Founder & sourcing lead, connecting mountain growers with customers worldwide.',
      profilePic: '',
    },
    {
      name: 'Mohammed',
      position: 'Operations Manager',
      intro: 'Operations manager ensuring every product is handled with care and shipped promptly.',
      profilePic: '',
    },
    {
      name: 'Sara',
      position: 'Customer Experience Lead',
      intro: 'Customer experience lead, available to support you before, during, and after every order.',
      profilePic: '',
    },
  ],
};

export const getStoreSettings = async (req, res, next) => {
  try {
    const storeSetting = await Setting.findOne({ key: 'store' }).lean();
    const settings = storeSetting?.value || DEFAULT_STORE_SETTINGS;
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const getAdminStoreSettings = async (req, res, next) => {
  try {
    const storeSetting = await Setting.findOne({ key: 'store' }).lean();
    const settings = storeSetting?.value || DEFAULT_STORE_SETTINGS;

    const orderStatusCounts = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);
    const orderCounts = orderStatusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        ...settings,
        totalOrders:
          (orderCounts.pending || 0) +
          (orderCounts.confirmed || 0) +
          (orderCounts.shipped || 0) +
          (orderCounts.delivered || 0) +
          (orderCounts.cancelled || 0),
        orderStatusCounts: orderStatusCounts,
        deliveredOrders: orderCounts.delivered || 0,
        cancelledOrders: orderCounts.cancelled || 0,
        updatedAt: storeSetting?.updatedAt || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateStoreSettings = async (req, res, next) => {
  try {
    const { logo, storeName, tagline, team } = req.body;

    const existingSetting = await Setting.findOne({ key: 'store' }).lean();
    const existingValue = existingSetting?.value || {};

    const updatedSetting = await Setting.findOneAndUpdate(
      { key: 'store' },
      {
        key: 'store',
        value: {
          storeName: storeName?.trim() ?? existingValue.storeName ?? DEFAULT_STORE_SETTINGS.storeName,
          tagline: tagline?.trim() ?? existingValue.tagline ?? DEFAULT_STORE_SETTINGS.tagline,
          logo: logo ?? existingValue.logo ?? '',
          team: Array.isArray(team)
            ? team
            : Array.isArray(existingValue.team)
            ? existingValue.team
            : DEFAULT_STORE_SETTINGS.team,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({ success: true, data: updatedSetting.value });
  } catch (error) {
    next(error);
  }
};
