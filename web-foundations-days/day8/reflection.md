
# Day 8 Reflection

The most difficult concept in this course was understanding how to prevent two users from buying the same seat at the same time. At first, I thought using a cache or adding more application servers would solve the problem. However, I learned that these techniques improve performance but do not guarantee correct seat allocation. I overcame this challenge by studying database transactions, atomic conditional updates, row-level locking, and unique constraints. I now understand why the database must be the authoritative source for seat availability and why payment confirmation must be handled carefully.

Based on the feedback I received on my capstone, I would improve the system design documentation, especially the explanation of how the architecture components work together. I would make the data flow clearer, explain the responsibilities of each component, and provide more detailed examples of API requests, error responses, and database transactions. I would also strengthen the capacity estimates and testing plan to demonstrate how the application handles sudden increases in traffic.

Next, I plan to learn more about cloud architecture, distributed systems, database optimization, and automated load testing. I also want to practice deploying scalable applications using Docker and cloud services. These skills will help me design systems that are reliable, secure, maintainable, and capable of supporting many users while protecting data correctness.
