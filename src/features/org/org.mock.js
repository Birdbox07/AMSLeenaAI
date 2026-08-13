export const ORG_TREE = {
  id:"EMP001", name:"Rajesh Sharma", designation:"Chief Executive Officer", department:"Executive",
  email:"rajesh.sharma@company.com", reportCount:4,
  children:[
    {
      id:"EMP002", name:"Priya Verma", designation:"VP Engineering", department:"Engineering",
      email:"priya.verma@company.com", reportCount:8,
      children:[
        { id:"EMP010", name:"Vikram Singh", designation:"Engineering Manager", department:"Engineering", email:"vikram.singh@company.com", reportCount:4,
          children:[
            { id:"EMP011", name:"Amit Kumar", designation:"Tech Lead", department:"Engineering", email:"amit.kumar@company.com", reportCount:2, children:[
              { id:"EMP021", name:"Sneha Patel", designation:"Senior SWE", department:"Engineering", email:"sneha.patel@company.com", reportCount:0 },
              { id:"EMP022", name:"Arjun Reddy", designation:"Software Engineer", department:"Engineering", email:"arjun.reddy@company.com", reportCount:0 },
            ]},
            { id:"EMP012", name:"Kavya Mehta", designation:"Tech Lead", department:"Engineering", email:"kavya.mehta@company.com", reportCount:2, children:[
              { id:"EMP023", name:"Deepa Nair", designation:"Senior SWE", department:"Engineering", email:"deepa.nair@company.com", reportCount:0 },
              { id:"EMP024", name:"Kiran Iyer", designation:"Software Engineer", department:"Engineering", email:"kiran.iyer@company.com", reportCount:0 },
            ]},
          ]
        },
        { id:"EMP013", name:"Nisha Pillai", designation:"Engineering Manager", department:"Engineering", email:"nisha.pillai@company.com", reportCount:3,
          children:[
            { id:"EMP025", name:"Ravi Rao", designation:"Senior SWE", department:"Engineering", email:"ravi.rao@company.com", reportCount:0 },
            { id:"EMP026", name:"Meera Naidu", designation:"Software Engineer", department:"Engineering", email:"meera.naidu@company.com", reportCount:0 },
          ]
        },
      ]
    },
    {
      id:"EMP003", name:"Suresh Joshi", designation:"VP Sales", department:"Sales",
      email:"suresh.joshi@company.com", reportCount:5,
      children:[
        { id:"EMP014", name:"Anjali Chopra", designation:"Sales Manager", department:"Sales", email:"anjali.chopra@company.com", reportCount:3,
          children:[
            { id:"EMP027", name:"Sanjay Malhotra", designation:"Sales Executive", department:"Sales", email:"sanjay.malhotra@company.com", reportCount:0 },
            { id:"EMP028", name:"Pooja Sharma", designation:"Sales Executive", department:"Sales", email:"pooja.sharma@company.com", reportCount:0 },
          ]
        },
      ]
    },
    {
      id:"EMP004", name:"Anil Verma", designation:"VP Human Resources", department:"Human Resources",
      email:"anil.verma@company.com", reportCount:4,
      children:[
        { id:"EMP015", name:"Rekha Gupta", designation:"HR Manager", department:"Human Resources", email:"rekha.gupta@company.com", reportCount:3,
          children:[
            { id:"EMP029", name:"Rajesh Pandey", designation:"HR Executive", department:"Human Resources", email:"rajesh.pandey@company.com", reportCount:0 },
            { id:"EMP030", name:"Sunita Agarwal", designation:"HR Executive", department:"Human Resources", email:"sunita.agarwal@company.com", reportCount:0 },
          ]
        },
      ]
    },
    {
      id:"EMP005", name:"Manoj Bansal", designation:"VP Finance", department:"Finance",
      email:"manoj.bansal@company.com", reportCount:3,
      children:[
        { id:"EMP016", name:"Geeta Kapoor", designation:"Finance Manager", department:"Finance", email:"geeta.kapoor@company.com", reportCount:2,
          children:[
            { id:"EMP031", name:"Nitin Sinha", designation:"Finance Analyst", department:"Finance", email:"nitin.sinha@company.com", reportCount:0 },
          ]
        },
      ]
    },
  ]
};
