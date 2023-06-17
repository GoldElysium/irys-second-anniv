import { CollectionConfig } from "payload/types";

const Events: CollectionConfig = {
  slug: "events",
  labels: {
    singular: "Event",
    plural: "Events",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "date",
      type: "date",
      required: true,
    },
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "images",
      type: "array",
      required: true,
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "events-media",
          filterOptions: {
            mimeType: {
              or: [
                { equals: "image/jpeg" },
                { equals: "image/png" },
                { equals: "image/bmp" },
              ],
            },
          },
        }
      ],
    },
    {
      name: "background_image",
      type: "upload",
      required: false,
      relationTo: "events-media",
      filterOptions: {
        mimeType: {
          or: [
            { equals: "image/jpeg" },
            { equals: "image/png" },
            { equals: "image/bmp" },
          ],
        },
      },
    },
    {
      name: "content",
      type: "richText",
      required: true,
    },
  ],
};

export default Events;
