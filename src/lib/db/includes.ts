export const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

export const ticketInclude = {
  assignedTo: { select: userSelect },
  createdBy: { select: userSelect },
} as const;

export const ticketDetailInclude = {
  ...ticketInclude,
  comments: {
    orderBy: { createdAt: "asc" as const },
    include: {
      createdBy: { select: userSelect },
    },
  },
} as const;

export const commentInclude = {
  createdBy: { select: userSelect },
} as const;
