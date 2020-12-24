import { Collection, Role } from 'discord.js';
import FuzzySet from 'fuzzyset';

// "Intro to " will be dropped from messages
const roleAliases: Record<string, string> = {
  Stats: 'Statistics',
  'Visual and Procedural Programming': 'Intro to C#',
  'Programming 1': 'Programming I',
  'Programming 2': 'Programming II',
  'Computer Science I': 'Programming I',
  'Computer Science II': 'Programming II',
  'Computer Science 1': 'Programming I',
  'Computer Science 2': 'Programming II',
  'Compsci 1': 'Programming I',
  'Compsci 2': 'Programming II',
  CS1: 'Programming I',
  CS2: 'Programming II',
  OOP: 'Intro to OOP',
  'Object-Oriented Programming': 'Intro to OOP',
  'Computational Structures': 'Comp Structures',
  Automata: 'Theory of Computation',
  Architecture: 'Computer Architecture',
  'Architecture and Organization': 'Computer Architecture',
  'Computer Arch and Org': 'Computer Architecture',
  Hardware: 'Computer Architecture',
  'Computer Lab': 'Computer Architecture',
  Security: 'Computer Security',
  'Computer Forensics': 'Forensics',
  'Web Systems Development': 'Web Systems',
  DS: 'Data Structures',
  'Sys Admin': 'Systems Admin',
  'Systems Administration': 'Systems Admin',
  UI: 'User Interface Design',
  'UI Design': 'User Interface Design',
  'User Interface': 'User Interface Design',
  'Legal and Ethical': 'Legal & Ethical',
  'Legal Ethical Issues in Computing': 'Legal & Ethical',
  'Computer Networks': 'Networks',
  'Computer Networks and Distributed Processing': 'Networks',
  'Computer Crypotgraphy': 'Cryptography',
  IP: 'Internet Programming',
  'Design and Analysis of Algorithms': 'Algorithms',
  'Analysis of Algorithms': 'Algorithms',
  IDS: 'Intrusion Detection',
  'Web Dev': 'Web Dev Frameworks',
  'Network Security and Management': 'Network Security',
  ML: 'Machine Learning',
  AI: 'Artificial Intelligence',
  OS: 'Operating Systems',
  'Ahuja OS': 'Operating Systems',
  'OS Env': 'Operating Systems Env',
  'OS Environments': 'Operating Systems Env',
  'Littleton OS': 'Operating Systems Env',
  'Operating Systems Environments and Administration': 'Operating Systems Env',
  'Big Data': 'Databases',
  'Data Modeling': 'Databases', // legacy course name
  'Information Systems Senior Project': 'IS Senior Project',
  'Construction of Language Translators': 'Compilers',
  'Language Translators': 'Compilers',
};

export const getClassRoles = (roles: Collection<string, Role>): Role[] => {
  const allRoles = Array.from(roles.sort((a, b) => a.position - b.position).values());
  const start = allRoles.findIndex((role) => role.name === 'Linear Algebra');
  const end = allRoles.findIndex((role) => role.name === 'Compilers');
  return allRoles.slice(start, end + 1);
};

export class RoleSet {
  rolesSet: FuzzySet;

  constructor(private roles: Role[], private threshold: number = 0.7) {
    this.rolesSet = FuzzySet([...roles.map((it) => it.name), ...Object.keys(roleAliases)]);
  }

  get(candidate: string): Role | null {
    const [[confidence, roleName]] = this.rolesSet.get(candidate) || [[]];

    if (!confidence || confidence < this.threshold) {
      return null;
    }

    // Undo the alias to get the underlying official role
    const realRoleName = roleAliases[roleName] || roleName;
    return this.roles.find((role) => role.name === realRoleName);
  }
}
