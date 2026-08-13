// Cross-feature mock-data constants and helpers shared by 2+ features.
export const DEPTS = ["Engineering","Human Resources","Finance","Operations","Marketing","Sales","Legal","Administration"];
export const LOCS = ["Mumbai","Delhi","Bangalore","Chennai","Hyderabad","Pune"];
export const DESIGS = [
  "Software Engineer","Senior Software Engineer","Tech Lead","Engineering Manager",
  "HR Executive","HR Manager","Finance Analyst","Finance Manager",
  "Operations Executive","Operations Manager","Marketing Executive","Marketing Manager",
  "Sales Executive","Sales Manager","Legal Counsel","Admin Executive","Director","VP","Analyst"
];
export const LEAVE_TYPES = ["Casual Leave","Sick Leave","Earned Leave","Maternity Leave","Paternity Leave","Compensatory Leave","On Duty"];
export const LEAVE_SESSIONS = ["First Session","Second Session","Full Session"];
export const FIRST_NAMES = ["Rahul","Priya","Amit","Sneha","Vikram","Anjali","Suresh","Kavya","Arjun","Deepa","Kiran","Nisha","Ravi","Meera","Sanjay","Pooja","Anil","Rekha","Rajesh","Sunita","Manoj","Geeta","Nitin","Shweta","Vinod","Harish","Usha","Prakash","Divya","Rohit","Shreya","Ajay","Bhavna","Sunil","Archana","Ramesh","Seema","Naveen","Gaurav","Ritu","Vivek","Manisha","Lokesh","Swati","Chetan","Anita","Sujata","Kishore","Pallavi","Arvind"];
export const LAST_NAMES = ["Sharma","Verma","Singh","Gupta","Kumar","Patel","Shah","Mehta","Joshi","Chopra","Malhotra","Reddy","Nair","Iyer","Pillai","Rao","Naidu","Murthy","Pandey","Srivastava","Agarwal","Bansal","Kapoor","Sinha","Mishra","Tiwari","Dubey","Yadav","Chauhan","Thakur","Bose","Ghosh","Chatterjee","Mukherjee","Das","Roy","Sen","Biswas","Paul","Chowdhury","Dutta","Banerjee","Sarkar","Mondal","Kulkarni","Desai","Patil","More","Jadhav","Shinde"];

export const seed = (n) => {
  let x = Math.sin(n + 1) * 10000;
  return x - Math.floor(x);
};

export function genDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}
