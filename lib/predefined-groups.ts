// Predefined groups structure
export const PREDEFINED_GROUPS = {
  categories: [
    {
      name: "Superachiever",
      groups: [
        { id: "personal", name: "Personal" },
        { id: "business", name: "Business" },
        { id: "supermind", name: "Supermind" },
      ],
    },
    {
      name: "Superachievers",
      groups: [
        { id: "superpuzzle", name: "Superpuzzle" },
        { id: "superhuman", name: "Superhuman" },
        { id: "supersociety", name: "Supersociety" },
        { id: "supergenius", name: "Supergenius" },
      ],
    },
    {
      name: "Supercivilization",
      groups: [{ id: "supercivilization", name: "Supercivilization" }],
    },
  ],

  // Flatten all groups for easy access
  getAllGroups() {
    return this.categories.flatMap((category) =>
      category.groups.map((group) => ({
        ...group,
        category: category.name,
      })),
    )
  },

  // Get a specific group by ID
  getGroupById(id: string) {
    return this.getAllGroups().find((group) => group.id === id)
  },
}

