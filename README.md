SPIT is a simple PHP/MySQL bug tracking issue.
Designed to be simple and easy to setup and for personal use.

Create database on MySQL:
create database test1db;

Create new user:
grant usage on *.* to test1user@localhost identified by 'test1pass';

Grant all priveleges:
grant all privileges on test1db.* to test1user@localhost ;
