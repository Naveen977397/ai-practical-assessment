import { Priority, TicketStatus } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { listTickets } from "@/lib/services/ticket.service";
import {
  createTestTicket,
  disconnectTestPrisma,
  resetTestDatabase,
  seedTestUsers,
} from "../helpers/test-db";

describe("listTickets integration", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestPrisma();
  });

  it("returns paginated results with defaults", async () => {
    const { creator } = await seedTestUsers();
    await createTestTicket(creator.id);

    const result = await listTickets({
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 10,
    });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("filters by status", async () => {
    const { creator } = await seedTestUsers();
    await createTestTicket(creator.id, TicketStatus.OPEN);
    await createTestTicket(creator.id, TicketStatus.CLOSED);

    const result = await listTickets({
      status: TicketStatus.OPEN,
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 10,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].status).toBe(TicketStatus.OPEN);
  });

  it("filters by priority", async () => {
    const { creator } = await seedTestUsers();
    await createTestTicket(creator.id);
    await prisma.ticket.create({
      data: {
        title: "High priority",
        description: "Urgent",
        priority: Priority.HIGH,
        status: TicketStatus.OPEN,
        createdById: creator.id,
      },
    });

    const result = await listTickets({
      priority: Priority.HIGH,
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 10,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].priority).toBe(Priority.HIGH);
  });

  it("filters by unassigned assignee", async () => {
    const { creator, agent } = await seedTestUsers();
    await createTestTicket(creator.id);
    await prisma.ticket.create({
      data: {
        title: "Assigned",
        description: "Has assignee",
        priority: Priority.MEDIUM,
        status: TicketStatus.OPEN,
        createdById: creator.id,
        assignedToId: agent.id,
      },
    });

    const result = await listTickets({
      assignedToId: "unassigned",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 10,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].assignedTo).toBeNull();
  });

  it("searches by keyword in title", async () => {
    const { creator } = await seedTestUsers();
    await prisma.ticket.create({
      data: {
        title: "Printer issue",
        description: "Other",
        priority: Priority.LOW,
        status: TicketStatus.OPEN,
        createdById: creator.id,
      },
    });
    await prisma.ticket.create({
      data: {
        title: "Email outage",
        description: "Cannot send",
        priority: Priority.HIGH,
        status: TicketStatus.OPEN,
        createdById: creator.id,
      },
    });

    const result = await listTickets({
      q: "printer",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 10,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("Printer issue");
  });

  it("paginates results", async () => {
    const { creator } = await seedTestUsers();
    for (let i = 0; i < 5; i++) {
      await createTestTicket(creator.id);
    }

    const page1 = await listTickets({
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 2,
    });
    const page2 = await listTickets({
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 2,
      limit: 2,
    });

    expect(page1.items).toHaveLength(2);
    expect(page1.total).toBe(5);
    expect(page1.totalPages).toBe(3);
    expect(page2.items).toHaveLength(2);
    expect(page1.items[0].id).not.toBe(page2.items[0].id);
  });
});
